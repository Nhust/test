# Utilise l'image officielle Nginx
FROM nginx:alpine

# Supprime la page par défaut
RUN rm /usr/share/nginx/html/*

# Copie ton index.html dans le dossier web
COPY index.html /usr/share/nginx/html/

# Expose le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
