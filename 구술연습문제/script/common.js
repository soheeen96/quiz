$(document).ready(function() {
    // ===== 데이터 구조 및 저장 시스템 =====
    
    // 로컬스토리지 키
    const STORAGE_KEY = 'quiz_questions';
    
    // 문제 데이터 구조
    class Question {
        constructor(question, answer, keywords) {
            this.id = Date.now() + Math.random().toString(36).substr(2, 9);
            this.question = question.trim();
            this.answer = answer.trim();
            this.keywords = keywords.split(',').map(k => k.trim()).filter(k => k);
            this.createdAt = new Date().toISOString();
        }
    }
    
    // 데이터 관리 객체
    const QuestionManager = {
        // 모든 문제 가져오기
        getAll: function() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('데이터 로드 오류:', error);
                return [];
            }
        },
        
        // 문제 저장하기
        save: function(questions) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
                return true;
            } catch (error) {
                console.error('데이터 저장 오류:', error);
                return false;
            }
        },
        
        // 새 문제 추가
        add: function(question, answer, keywords) {
            const questions = this.getAll();
            const newQuestion = new Question(question, answer, keywords);
            questions.push(newQuestion);
            return this.save(questions) ? newQuestion : null;
        },
        
        // 문제 삭제
        delete: function(id) {
            const questions = this.getAll();
            const filteredQuestions = questions.filter(q => q.id !== id);
            return this.save(filteredQuestions);
        },
        
        // 문제 수정
        update: function(id, question, answer, keywords) {
            const questions = this.getAll();
            const index = questions.findIndex(q => q.id === id);
            if (index !== -1) {
                questions[index] = {
                    ...questions[index],
                    question: question.trim(),
                    answer: answer.trim(),
                    keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
                };
                return this.save(questions);
            }
            return false;
        },
        
        // ID로 문제 찾기
        findById: function(id) {
            const questions = this.getAll();
            return questions.find(q => q.id === id) || null;
        },
        
        // 랜덤 문제 가져오기
        getRandom: function() {
            const questions = this.getAll();
            if (questions.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * questions.length);
            return questions[randomIndex];
        },
        
        // 데이터 통계
        getStats: function() {
            const questions = this.getAll();
            return {
                total: questions.length,
                avgKeywords: questions.length > 0 ? 
                    (questions.reduce((sum, q) => sum + q.keywords.length, 0) / questions.length).toFixed(1) : 0
            };
        }
    };
    
    // ===== 초기 더미 데이터 생성 =====
    function initializeDummyData() {
        const existingQuestions = QuestionManager.getAll();
        if (existingQuestions.length === 0) {
            const dummyQuestions = [
                {
                    question: "JavaScript에서 변수를 선언하는 키워드 3가지는 무엇인가요?",
                    answer: "var, let, const입니다. var은 함수 스코프, let과 const는 블록 스코프를 가지며, const는 재할당이 불가능합니다.",
                    keywords: "var, let, const, 변수, 선언"
                },
                {
                    question: "HTML5에서 새로 추가된 시맨틱 태그들을 3개 이상 말해보세요.",
                    answer: "header, nav, section, article, aside, footer, main 등이 있습니다.",
                    keywords: "header, nav, section, article, aside, footer, main, 시맨틱"
                },
                {
                    question: "CSS에서 박스 모델의 구성 요소 4가지는 무엇인가요?",
                    answer: "content, padding, border, margin입니다. 안쪽부터 순서대로 콘텐츠, 패딩, 보더, 마진입니다.",
                    keywords: "content, padding, border, margin, 박스모델, 콘텐츠, 패딩, 보더, 마진"
                }
            ];
            
            dummyQuestions.forEach(dummy => {
                QuestionManager.add(dummy.question, dummy.answer, dummy.keywords);
            });
            
            console.log('더미 데이터 생성 완료:', QuestionManager.getStats());
        }
    }
    
    // ===== UI 업데이트 함수들 =====
    
    // 문제 목록 렌더링
    function renderQuestionList() {
        const questions = QuestionManager.getAll();
        const container = $('#questionListContainer');
        
        if (questions.length === 0) {
            container.html(`
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                    <p>등록된 문제가 없습니다.<br>위 폼을 사용해서 첫 번째 문제를 등록해보세요!</p>
                </div>
            `);
        } else {
            let html = '';
            questions.forEach((q, index) => {
                html += `
                    <div class="question-item" data-id="${q.id}" style="
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 15px;
                        background: #f7fafc;
                        transition: all 0.3s ease;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                                문제 ${index + 1}
                            </span>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-edit" style="
                                    background: #48bb78; color: white; border: none; padding: 6px 12px; 
                                    border-radius: 6px; font-size: 12px; cursor: pointer;
                                ">
                                    <i class="fas fa-edit"></i> 수정
                                </button>
                                <button class="btn-delete" style="
                                    background: #f56565; color: white; border: none; padding: 6px 12px; 
                                    border-radius: 6px; font-size: 12px; cursor: pointer;
                                ">
                                    <i class="fas fa-trash"></i> 삭제
                                </button>
                            </div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #2d3748;">문제:</strong>
                            <p style="margin: 5px 0; color: #4a5568; line-height: 1.5;">${q.question}</p>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #2d3748;">정답:</strong>
                            <p style="margin: 5px 0; color: #4a5568; line-height: 1.5;">${q.answer}</p>
                        </div>
                        <div>
                            <strong style="color: #2d3748;">키워드:</strong>
                            <div style="margin-top: 5px;">
                                ${q.keywords.map(keyword => `
                                    <span style="
                                        background: #bee3f8; color: #2b6cb0; padding: 2px 8px; 
                                        border-radius: 12px; font-size: 12px; margin-right: 5px; 
                                        display: inline-block; margin-bottom: 3px;
                                    ">${keyword}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; color: #a0aec0;">
                            등록일: ${new Date(q.createdAt).toLocaleString('ko-KR')}
                        </div>
                    </div>
                `;
            });
            
            container.html(html);
        }
        
        // 통계 업데이트
        const stats = QuestionManager.getStats();
        $('.question-list h2').html(`
            <i class="fas fa-list"></i> 등록된 문제 (${stats.total}개)
        `);
    }
    
    // 현재 문제 표시
    let currentQuestion = null;
    function displayCurrentQuestion() {
        const question = QuestionManager.getRandom();
        if (question) {
            currentQuestion = question;
            $('.question-text').text(question.question);
            $('#correctAnswer').text(question.answer);
            $('.question-number').text(`문제 ${QuestionManager.getAll().findIndex(q => q.id === question.id) + 1}`);
        } else {
            $('.question-text').text('등록된 문제가 없습니다. "문제 관리"에서 문제를 등록해주세요!');
            $('#correctAnswer').text('');
            $('.question-number').text('문제 0');
        }
    }
    
    // ===== 이벤트 핸들러 =====
    
    // 페이지 전환 기능
    function showPage(pageId) {
        $('.page').removeClass('active');
        $('#' + pageId).addClass('active').addClass('fade-in');
        
        // 헤더 버튼 상태 업데이트
        if (pageId === 'quizPage') {
            $('#manageBtn').text(' 문제 관리').prepend('<i class="fas fa-cog"></i>');
        } else {
            $('#manageBtn').text(' 문제 풀이').prepend('<i class="fas fa-play"></i>');
        }
        
        // 페이지별 데이터 업데이트
        if (pageId === 'adminPage') {
            renderQuestionList();
        } else {
            displayCurrentQuestion();
        }
    }

    // 문제 관리 버튼 클릭
    $('#manageBtn').click(function() {
        const currentPage = $('.page.active').attr('id');
        if (currentPage === 'quizPage') {
            showPage('adminPage');
        } else {
            showPage('quizPage');
        }
    });

    // 메인으로 돌아가기 버튼
    $('#backToMainBtn').click(function() {
        showPage('quizPage');
    });

    // 새 문제 버튼
    $('#newQuestionBtn').click(function() {
        $(this).find('i').addClass('fa-spin');
        displayCurrentQuestion();
        setTimeout(() => {
            $(this).find('i').removeClass('fa-spin');
        }, 500);
    });

    // 정답 토글 기능
    $('#toggleAnswerBtn').click(function() {
        const $answerDisplay = $('#answerDisplay');
        
        if ($answerDisplay.hasClass('show')) {
            $answerDisplay.removeClass('show');
            $(this).html('<i class="fas fa-eye"></i> 정답 보기');
        } else {
            $answerDisplay.addClass('show');
            $(this).html('<i class="fas fa-eye-slash"></i> 정답 숨기기');
        }
    });

    // 문제 등록 폼
    $('#questionForm').submit(function(e) {
        e.preventDefault();
        
        const question = $('#questionInput').val().trim();
        const answer = $('#answerInput').val().trim();
        const keywords = $('#keywordsInput').val().trim();
        
        if (question && answer && keywords) {
            const newQuestion = QuestionManager.add(question, answer, keywords);
            
            if (newQuestion) {
                // 성공 메시지
                const $submitBtn = $(this).find('button[type="submit"]');
                const originalText = $submitBtn.html();
                $submitBtn.html('<i class="fas fa-check"></i> 등록 완료!').prop('disabled', true);
                
                setTimeout(() => {
                    $submitBtn.html(originalText).prop('disabled', false);
                }, 1500);
                
                // 폼 리셋
                this.reset();
                
                // 목록 업데이트
                renderQuestionList();
                
                console.log('새 문제 등록:', newQuestion);
            } else {
                alert('문제 등록에 실패했습니다. 다시 시도해주세요.');
            }
        } else {
            alert('모든 필드를 입력해주세요.');
        }
    });

    // 문제 삭제 및 수정 이벤트 (이벤트 위임)
    $(document).on('click', '.btn-delete', function() {
        const questionId = $(this).closest('.question-item').data('id');
        const question = QuestionManager.findById(questionId);
        
        if (question && confirm(`"${question.question.substring(0, 50)}..." 문제를 삭제하시겠습니까?`)) {
            if (QuestionManager.delete(questionId)) {
                $(this).closest('.question-item').fadeOut(300, function() {
                    $(this).remove();
                    renderQuestionList();
                });
            } else {
                alert('문제 삭제에 실패했습니다.');
            }
        }
    });

    $(document).on('click', '.btn-edit', function() {
        const questionId = $(this).closest('.question-item').data('id');
        const question = QuestionManager.findById(questionId);
        
        if (question) {
            // 폼에 기존 데이터 채우기
            $('#questionInput').val(question.question);
            $('#answerInput').val(question.answer);
            $('#keywordsInput').val(question.keywords.join(', '));
            
            // 폼 제출 버튼 임시 변경
            const $form = $('#questionForm');
            const $submitBtn = $form.find('button[type="submit"]');
            const originalText = $submitBtn.html();
            
            $submitBtn.html('<i class="fas fa-save"></i> 수정 완료').data('editing', questionId);
            
            // 폼 상단으로 스크롤
            $('html, body').animate({
                scrollTop: $form.offset().top - 100
            }, 500);
            
            // 취소 버튼 추가
            if (!$form.find('.btn-cancel').length) {
                $submitBtn.after('<button type="button" class="btn btn-secondary btn-cancel" style="margin-left: 10px;"><i class="fas fa-times"></i> 취소</button>');
            }
        }
    });

    // 수정 취소
    $(document).on('click', '.btn-cancel', function() {
        const $form = $('#questionForm');
        const $submitBtn = $form.find('button[type="submit"]');
        
        $form[0].reset();
        $submitBtn.html('<i class="fas fa-save"></i> 문제 등록').removeData('editing');
        $(this).remove();
    });

    // 폼 제출 시 수정 모드 처리
    $('#questionForm').submit(function(e) {
        e.preventDefault();
        
        const $submitBtn = $(this).find('button[type="submit"]');
        const editingId = $submitBtn.data('editing');
        
        const question = $('#questionInput').val().trim();
        const answer = $('#answerInput').val().trim();
        const keywords = $('#keywordsInput').val().trim();
        
        if (question && answer && keywords) {
            let success = false;
            
            if (editingId) {
                // 수정 모드
                success = QuestionManager.update(editingId, question, answer, keywords);
                if (success) {
                    $submitBtn.html('<i class="fas fa-check"></i> 수정 완료!').prop('disabled', true);
                    setTimeout(() => {
                        $submitBtn.html('<i class="fas fa-save"></i> 문제 등록').prop('disabled', false).removeData('editing');
                        $('.btn-cancel').remove();
                    }, 1500);
                }
            } else {
                // 등록 모드
                const newQuestion = QuestionManager.add(question, answer, keywords);
                success = !!newQuestion;
                if (success) {
                    $submitBtn.html('<i class="fas fa-check"></i> 등록 완료!').prop('disabled', true);
                    setTimeout(() => {
                        $submitBtn.html('<i class="fas fa-save"></i> 문제 등록').prop('disabled', false);
                    }, 1500);
                }
            }
            
            if (success) {
                this.reset();
                renderQuestionList();
            } else {
                alert('작업에 실패했습니다. 다시 시도해주세요.');
            }
        } else {
            alert('모든 필드를 입력해주세요.');
        }
    });

    // 이전/다음 버튼
    $('#prevBtn, #nextBtn').click(function() {
        displayCurrentQuestion();
    });

    // 반응형 헤더 조정
    function adjustHeader() {
        const $header = $('.header');
        
        if ($(window).width() <= 768) {
            $header.addClass('mobile-header');
        } else {
            $header.removeClass('mobile-header');
        }
    }

    // ===== 초기화 =====
    adjustHeader();
    $(window).resize(adjustHeader);
    
    // 더미 데이터 생성 및 초기 화면 설정
    initializeDummyData();
    displayCurrentQuestion();
    
    // 개발자 도구용 전역 변수
    window.QuestionManager = QuestionManager;
    console.log('문제 관리 시스템 초기화 완료');
    console.log('현재 저장된 문제 수:', QuestionManager.getStats().total);
});