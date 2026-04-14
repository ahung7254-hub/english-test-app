# English Test App

학생용 영어 지문 해석, 영작, 단어 테스트 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 배포용 빌드

```bash
npm install
npm run build
```

Cloudtype에서 다음처럼 설정하면 됩니다.

- Build Command: `npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

처음 버전에는 다음 기능이 들어 있습니다.

- 지문 등록
- 해석 배열 테스트
- 영작 배열 테스트
- 단어 3지선다 테스트
- 결과 확인
