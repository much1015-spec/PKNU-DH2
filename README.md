# 냥냥! 간식 받기

브라우저에서 바로 실행되는 간단한 낙하 게임입니다. 음식은 +1점, 장난감은 생명 -1이며 생명은 3개입니다.

## 로컬 실행

`index.html`을 브라우저로 열거나, VS Code Live Server 같은 정적 서버로 실행하세요.

## Firebase 점수판 연결

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트와 **Cloud Firestore** 데이터베이스를 만듭니다.
2. 웹 앱을 추가한 뒤 SDK 설정값을 복사합니다.
3. `app.js`의 `firebaseConfig` 주석 부분에 설정값을 입력합니다.
4. Firebase CLI에서 로그인 후 실행합니다.

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

Firebase 설정 전에도 게임은 동작하며, 예시 점수판을 표시합니다.

## GitHub → Vercel 배포

```bash
git init
git add .
git commit -m "Add cat snack catcher game"
git branch -M main
git remote add origin https://github.com/USERNAME/cat-snack-catcher.git
git push -u origin main
```

그 다음 [Vercel](https://vercel.com/new)에서 GitHub 저장소를 Import하세요. 프레임워크는 **Other**, 빌드 명령은 비워 두고, 배포 디렉터리는 `.`으로 설정하면 됩니다. 이후 `main` 브랜치 푸시마다 자동으로 배포됩니다.
