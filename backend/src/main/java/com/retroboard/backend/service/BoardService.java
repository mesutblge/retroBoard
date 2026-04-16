package com.retroboard.backend.service;

import com.retroboard.backend.dto.request.CreateBoardRequest;
import com.retroboard.backend.dto.request.CreateCardRequest;
import com.retroboard.backend.dto.response.BoardResponse;
import com.retroboard.backend.dto.response.CardResponse;
import com.retroboard.backend.entity.Board;
import com.retroboard.backend.entity.Card;
import com.retroboard.backend.entity.Team;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.exception.ResourceNotFoundException;
import com.retroboard.backend.repository.BoardRepository;
import com.retroboard.backend.repository.CardRepository;
import com.retroboard.backend.repository.TeamRepository;
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
    private final TeamRepository teamRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BoardResponse createBoard(CreateBoardRequest request, User user) {
        if (!user.isAdmin()) {
            throw new SecurityException("Yalnizca admin board olusturabilir.");
        }
        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() -> new ResourceNotFoundException("Takim bulunamadi: " + request.teamId()));
        if (!team.getCompany().getId().equals(user.getCompany().getId())) {
            throw new SecurityException("Bu takima erisim yetkiniz yok.");
        }
        Board board = Board.builder()
                .name(request.name())
                .createdBy(user)
                .team(team)
                .build();
        return BoardResponse.from(boardRepository.save(board));
    }

    public List<BoardResponse> getBoards(User user) {
        if (user.isAdmin()) {
            return boardRepository.findByTeam_CompanyOrderByCreatedAtDesc(user.getCompany())
                    .stream().map(BoardResponse::from).toList();
        } else {
            List<Team> userTeams = teamRepository.findByCompany(user.getCompany()).stream()
                    .filter(t -> t.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId())))
                    .toList();
            if (userTeams.isEmpty()) return List.of();
            return boardRepository.findByTeamInOrderByCreatedAtDesc(userTeams)
                    .stream().map(BoardResponse::from).toList();
        }
    }

    public BoardResponse getBoard(Long boardId, User user) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board bulunamadi: " + boardId));
        if (!board.getTeam().getCompany().getId().equals(user.getCompany().getId())) {
            throw new SecurityException("Bu boarda erisim yetkiniz yok.");
        }
        return BoardResponse.from(board);
    }

    @Transactional
    public void deleteBoard(Long boardId, User user) {
        if (!user.isAdmin()) {
            throw new SecurityException("Yalnizca admin board silebilir.");
        }
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board bulunamadi: " + boardId));
        if (!board.getTeam().getCompany().getId().equals(user.getCompany().getId())) {
            throw new SecurityException("Bu boardi silme yetkiniz yok.");
        }
        boardRepository.delete(board);
    }

    @Transactional
    public CardResponse addCard(Long boardId, CreateCardRequest request, User user) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board bulunamadi: " + boardId));
        if (!board.getTeam().getCompany().getId().equals(user.getCompany().getId())) {
            throw new SecurityException("Bu boarda erisim yetkiniz yok.");
        }

        Card card = Card.builder()
                .content(request.content())
                .columnType(request.columnType())
                .anonymous(request.anonymous())
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
                .orElseThrow(() -> new ResourceNotFoundException("Kart bulunamadi: " + cardId));
        card.setVoteCount(card.getVoteCount() + 1);
        CardResponse response = CardResponse.from(cardRepository.save(card));
        messagingTemplate.convertAndSend("/topic/board/" + card.getBoard().getId(), response);
        return response;
    }

    @Transactional
    public void deleteCard(Long cardId, User user) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Kart bulunamadi: " + cardId));

        boolean isOwner = card.getCreatedBy().getId().equals(user.getId());
        if (!isOwner && !user.isAdmin()) {
            throw new SecurityException("Bu karti silme yetkiniz yok.");
        }

        Long boardId = card.getBoard().getId();
        cardRepository.delete(card);
        messagingTemplate.convertAndSend("/topic/board/" + boardId, "card_deleted:" + cardId);
    }
}
