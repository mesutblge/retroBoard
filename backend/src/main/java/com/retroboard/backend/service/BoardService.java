package com.retroboard.backend.service;

import com.retroboard.backend.dto.request.CreateBoardRequest;
import com.retroboard.backend.dto.request.CreateCardRequest;
import com.retroboard.backend.dto.response.BoardResponse;
import com.retroboard.backend.dto.response.CardResponse;
import com.retroboard.backend.entity.Board;
import com.retroboard.backend.entity.Card;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.exception.ResourceNotFoundException;
import com.retroboard.backend.repository.BoardRepository;
import com.retroboard.backend.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BoardResponse createBoard(CreateBoardRequest request, User user) {
        if (!user.isAdmin()) {
            throw new SecurityException("Yalnızca admin board oluşturabilir.");
        }
        Board board = Board.builder()
                .name(request.name())
                .sprintName(request.sprintName())
                .createdBy(user)
                .build();
        return BoardResponse.from(boardRepository.save(board));
    }

    // Tüm kullanıcılar tüm boardları görür
    public List<BoardResponse> getAllBoards() {
        return boardRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BoardResponse::from)
                .toList();
    }

    public BoardResponse getBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found: " + boardId));
        return BoardResponse.from(board);
    }

    @Transactional
    public void deleteBoard(Long boardId, User user) {
        if (!user.isAdmin()) {
            throw new SecurityException("Yalnızca admin board silebilir.");
        }
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found: " + boardId));
        boardRepository.delete(board);
    }

    @Transactional
    public CardResponse addCard(Long boardId, CreateCardRequest request, User user) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found: " + boardId));

        Card card = Card.builder()
                .content(request.content())
                .columnType(request.columnType())
                .board(board)
                .createdBy(user)
                .build();

        CardResponse response = CardResponse.from(cardRepository.save(card));
        messagingTemplate.convertAndSend("/topic/board/" + boardId, response);
        return response;
    }

    @Transactional
    public CardResponse voteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardId));
        card.setVoteCount(card.getVoteCount() + 1);
        CardResponse response = CardResponse.from(cardRepository.save(card));
        messagingTemplate.convertAndSend("/topic/board/" + card.getBoard().getId(), response);
        return response;
    }

    @Transactional
    public void deleteCard(Long cardId, User user) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardId));

        boolean isOwner = card.getCreatedBy().getId().equals(user.getId());
        if (!isOwner && !user.isAdmin()) {
            throw new SecurityException("Bu kartı silme yetkiniz yok.");
        }

        Long boardId = card.getBoard().getId();
        cardRepository.delete(card);
        messagingTemplate.convertAndSend("/topic/board/" + boardId, "card_deleted:" + cardId);
    }
}
