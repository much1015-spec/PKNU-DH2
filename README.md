# 냥냥! 간식 받기

브라우저에서 바로 실행되는 간단한 낙하 게임입니다. 음식은 +1점, 장난감은 생명 -1이며 생명은 3개입니다.

## 로컬 실행

`index.html`을 브라우저로 열거나, VS Code Live Server 같은 정적 서버로 실행하세요.

## Firebase 사용

Firebase를 사용하지 않는 정적 게임으로 구성했습니다. 따라서 Firebase 계정, API 키, 데이터베이스 설정 없이 GitHub와 Vercel만으로 배포할 수 있습니다. 점수판은 예시 점수를 표시합니다.

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
