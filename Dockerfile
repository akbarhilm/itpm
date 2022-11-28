FROM repository.indonesian-aerospace.com:8082/custom/pm2-oracleclient

# COPY . itpm-app/
# WORKDIR /itpm-app
# Bundle APP files
COPY conf /itpm-app/conf/
COPY controller /itpm-app/controller/
COPY node_modules /itpm-app/node_modules/
COPY services /itpm-app/services/
COPY util /itpm-app/util/
# COPY .env.development .
COPY Dockerfile itpm-app/
COPY index.js itpm-app/
COPY jwtRS256.key.pub itpm-app/
COPY swaggerprofil.json itpm-app/
COPY swaggerproyek.json itpm-app/
COPY ecosystem.config.js itpm-app/

WORKDIR /itpm-app

# Install app dependencies
# ENV NPM_CONFIG_LOGLEVEL warn
# RUN npm install --production

# Expose the listening port of your app
EXPOSE 5000

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
#CMD [ "node", "index.js" ]
