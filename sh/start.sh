cd ..
export NODE_ENV=production
#PORT=80 forever start ./bin/www
PORT=80 pm2 start ./bin/www --name='icestat' -i 4
