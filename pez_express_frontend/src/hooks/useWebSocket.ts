// src/hooks/useCocinaSocket.ts
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Comanda } from "../types/Comanda";

export function useCocinaSocket() {
  const [comandas, setComanadas] = useState<Comanda[]>([]);
  const [conectado, setConectado] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const wsUrl = `${window.location.protocol}//${window.location.host}/ws`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,

      
      onConnect: () => {
        setConectado(true);
        client.subscribe("/topic/cocina", (message) => {
          const data: Comanda[] = JSON.parse(message.body);
          setComanadas(data);
        });
      },

      onDisconnect: () => setConectado(false),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, []);

  return { comandas, conectado };
}