package com.retroboard.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class EmojiWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/board/{boardId}/emoji")
    public void sendEmoji(@DestinationVariable Long boardId, @Payload String emoji) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId,
                Map.of("type", "emoji", "emoji", emoji));
    }
}
