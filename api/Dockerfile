FROM startx/sv-nodejs:latest

COPY . $APP_PATH/
RUN /bin/sx-nodejs build

WORKDIR $APP_PATH

EXPOSE 8080

VOLUME $APP_PATH

CMD [ "/bin/sx-nodejs" , "start" ]