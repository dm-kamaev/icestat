cd ..
export NODE_ENV=production
pm2 start cron.js --name='cron worker'
