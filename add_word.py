import json

def main():
    day = input("Day 번호를 입력하세요: ")
    words = []
    print("영어단어 → 한글뜻 순서로 입력하세요. 영어단어에 -1 입력 시 종료됩니다.")
    while True:
        eng = input("영어단어: ").strip()
        if eng == "-1":
            break
        kor = input("한글뜻: ").strip()
        words.append({"english": eng, "korean": kor})

    data = {
        "day": int(day),
        "words": words
    }

    filename = f"day{day}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"{filename} 파일이 생성되었습니다.")

if __name__ == "__main__":
    main()