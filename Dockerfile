FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY config /usr/share/nginx/html/config
COPY locales /usr/share/nginx/html/locales
COPY profiles /usr/share/nginx/html/profiles
COPY styles /usr/share/nginx/html/styles

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
