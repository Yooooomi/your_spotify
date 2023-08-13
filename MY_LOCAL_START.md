3 consoles

cd client; yarn start

docker compose -f docker-compose-mongo.yml up --build

nodemon -r dotenv/config src\bin\www.ts