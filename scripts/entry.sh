npm install --only-prod
npx sequelize db:create trending_asset_ms
npx sequelize db:migrate
npm run build
npm run start
