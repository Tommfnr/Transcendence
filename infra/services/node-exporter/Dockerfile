FROM prom/node-exporter:v1.9.1

EXPOSE 9100

ENTRYPOINT ["/bin/node_exporter"]

CMD ["--path.procfs=/host/proc", \
     "--path.sysfs=/host/sys", \
     "--path.rootfs=/host/root", \
     "--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)"]
