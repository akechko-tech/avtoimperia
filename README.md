# Автоимперия — Android-проект

1. Установите Android Studio (бесплатно, developer.android.com/studio).
2. File → Open → выберите папку Avtoimperia-Android. Дождитесь синхронизации Gradle (первый раз 5–10 минут, нужен интернет).
3. Build → Build App Bundle(s) / APK(s) → Build APK(s). Готовый файл: app/build/outputs/apk/debug/app-debug.apk
4. Перекиньте APK на телефон и установите (разрешите установку из неизвестных источников).

Чтобы обновить игру: замените app/src/main/assets/index.html новой версией и соберите заново.
Для Google Play / RuStore нужна подписанная release-сборка: Build → Generate Signed App Bundle / APK.

## iPhone (веб-приложение)
Папка `docs/` публикуется через GitHub Pages: https://akechko-tech.github.io/avtoimperia/
Откройте ссылку в Safari → «Поделиться» → «На экран „Домой“». Игра работает офлайн, сохранения хранятся на телефоне.
