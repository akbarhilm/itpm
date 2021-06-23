FROM 10.1.94.254:8082/custom/pm2-oracleclient

WORKDIR /itpm-app
# Bundle APP files
COPY . itpm-app/
# COPY conf conf/
# COPY controller controller/
# COPY node_modules node_modules/
# COPY services services/
# COPY util util/
# COPY .env.development .
# COPY Dockerfile .
# COPY index.js .
# COPY jwtRS256.key.pub .
# COPY swaggerprofil.json .
# COPY swaggerproyek.json .
# COPY ecosystem.config.js .

# Install app dependencies
# ENV NPM_CONFIG_LOGLEVEL warn
# RUN npm install --production

# Expose the listening port of your app
EXPOSE 5000

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]