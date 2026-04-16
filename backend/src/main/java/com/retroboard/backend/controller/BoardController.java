package com.retroboard.backend.controller;

import com.retroboard.backend.dto.request.CardOrderRequest;
import com.retroboard.backend.dto.request.CreateBoardRequest;
import com.retroboard.backend.dto.request.CreateCardRequest;
import com.retroboard.backend.dto.response.BoardResponse;
import com.retroboard.backend.dto.response.CardResponse;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@Valid @RequestBody CreateBoardRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.createBoard(request, user));
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoards(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.getBoards(user));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> getBoard(@PathVariable Long boardId,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.getBoard(boardId, user));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId,
                                             @AuthenticationPrincipal User user) {
        boardService.deleteBoard(boardId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{boardId}/cards")
    public ResponseEntity<CardResponse> addCard(@PathVariable Long boardId,
                                                 @Valid @RequestBody CreateCardRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.addCard(boardId, request, user));
    }

    @PostMapping("/{boardId}/reveal")
    public ResponseEntity<Void> toggleReveal(@PathVariable Long boardId,
                                              @AuthenticationPrincipal User user) {
        boardService.toggleReveal(boardId, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{boardId}/cards/reorder")
    public ResponseEntity<Void> reorderCards(@PathVariable Long boardId,
                                              @RequestBody List<CardOrderRequest> orders,
                                              @AuthenticationPrincipal User user) {
        boardService.reorderCards(boardId, orders, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cards/{cardId}/vote")
    public ResponseEntity<CardResponse> voteCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(boardService.voteCard(cardId));
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long cardId,
                                            @AuthenticationPrincipal User user) {
        boardService.deleteCard(cardId, user);
        return ResponseEntity.noContent().build();
    }
}
