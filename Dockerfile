FROM keymetrics/pm2:15-alpine

# Bundle APP files
COPY conf conf/
COPY controller controller/
COPY node_modules node_modules/
COPY services services/
COPY util util/
COPY .env .
COPY Dockerfile .
COPY index.js .
COPY jwtRS256.key.pub .
COPY swaggerprofil.json .
COPY swaggerproyek.json .
COPY ecosystem.config.js .

# Install app dependencies
# ENV NPM_CONFIG_LOGLEVEL warn
# RUN npm install --production

# Expose the listening port of your app
EXPOSE 5000

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]