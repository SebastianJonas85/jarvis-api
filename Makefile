deploy-service:
	rsync -avz ${PWD} pi@${HOST}:/home/pi 
	ssh pi@${HOST} "sudo mv /home/pi/jarvis-api/resources/JarvisAPI.service /lib/systemd/system/JarvisAPI.service && sudo systemctl daemon-reload && sudo systemctl daemon-reload && sudo systemctl enable JarvisAPI && sudo systemctl restart JarvisAPI"