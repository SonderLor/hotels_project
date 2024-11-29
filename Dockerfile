FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

COPY /frontend_service/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
