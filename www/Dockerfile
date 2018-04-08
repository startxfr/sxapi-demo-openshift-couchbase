FROM startx/sv-nodejs:latest

USER root
COPY . $APP_PATH/
RUN /bin/sx-nodejs build && \
    chmod ug+rw -R $APP_PATH && \
    chown 1001:0 -R $APP_PATH

#USER 1001

WORKDIR $APP_PATH

EXPOSE 8080

#VOLUME $APP_PATH

CMD [ "/bin/sx-nodejs" , "start" ]