#!/usr/bin/env python3
"""End-to-end smoke test for the local Flask app.

Run the server first:
    .venv\\Scripts\\python.exe app.py

Then in another shell:
    .venv\\Scripts\\python.exe tests\\smoke_test.py
"""

import os
import time

import requests


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "http://127.0.0.1:5000"
SMOKE_NOTE = "端到端测试数据"


def wait_for_server(timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            response = requests.get(BASE_URL + "/", timeout=2)
            if response.status_code == 200:
                return
        except requests.RequestException:
            pass
        time.sleep(1)
    raise RuntimeError(f"server did not become ready within {timeout}s")


def post_audio(path, person_type, person_id):
    with open(path, "rb") as audio_file:
        response = requests.post(
            f"{BASE_URL}/api/persons/{person_type}/{person_id}/audios",
            files={"audio": audio_file},
            timeout=300,
        )
    response.raise_for_status()
    return response.json()


def cleanup_previous_smoke_data():
    response = requests.get(BASE_URL + "/api/counselors", timeout=10)
    response.raise_for_status()
    for counselor in response.json():
        if counselor.get("note") == SMOKE_NOTE:
            delete_response = requests.delete(
                f"{BASE_URL}/api/counselors/{counselor['id']}",
                timeout=30,
            )
            delete_response.raise_for_status()


def main():
    wait_for_server()
    cleanup_previous_smoke_data()

    counselor = requests.post(
        BASE_URL + "/api/counselors",
        data={"name": "示例咨询师", "note": SMOKE_NOTE},
        timeout=10,
    )
    counselor.raise_for_status()
    counselor = counselor.json()

    client = requests.post(
        f"{BASE_URL}/api/counselors/{counselor['id']}/clients",
        data={"name": "示例来访者", "note": SMOKE_NOTE},
        timeout=10,
    )
    client.raise_for_status()
    client = client.json()

    counselor_audio = post_audio(
        os.path.join(PROJECT_ROOT, "samples", "audio", "kcyi_124.30_0.05.wav"),
        "counselor",
        counselor["id"],
    )
    client_audio = post_audio(
        os.path.join(PROJECT_ROOT, "samples", "audio", "kcyi_159.87_0.44.wav"),
        "client",
        client["id"],
    )

    compare = requests.post(
        BASE_URL + "/api/compare",
        json={"a_id": counselor_audio["id"], "b_id": client_audio["id"]},
        timeout=300,
    )
    compare.raise_for_status()
    decision = compare.json()["decision"]

    report = requests.get(
        f"{BASE_URL}/api/report/{counselor_audio['id']}/{client_audio['id']}",
        timeout=300,
    )
    report.raise_for_status()
    report_dir = os.path.join(PROJECT_ROOT, "output", "report")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, "smoke_report.docx")
    with open(report_path, "wb") as report_file:
        report_file.write(report.content)

    print("home: ok")
    print(f"counselor_id: {counselor['id']}")
    print(f"client_id: {client['id']}")
    print(f"audio_ids: {counselor_audio['id']}, {client_audio['id']}")
    print(f"verdict: {decision['verdict']} ({decision['confidence']})")
    print(f"report: {report_path}")


if __name__ == "__main__":
    main()
