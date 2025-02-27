from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)


class ReservationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "reservations"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def availability_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
