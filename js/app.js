/**
 * RÉSOLUTIONS ARCADE 2025
 * =======================
 * Application complète - Version sans modules ES6
 * Fonctionne en local (file://) et sur GitHub Pages
 * 
 * @author Arcade Dev Team
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================

    const CONFIG = Object.freeze({
        STORAGE_KEY: 'arcadeResolutions',
        POINTS_PER_COMPLETION: 1000,
        VICTORY_DISPLAY_DURATION: 2000,
        PARTICLE_COUNT: 20,
        PARTICLE_SPAWN_DELAY: 100,
        STARS_COUNT: 100,
        DEFAULT_REMINDER_DAYS: 7,
        PONG_BALL_SPEED: 5,
        PONG_PADDLE_SPEED: 8,
        PONG_WINNING_SCORE: 5,
    });

    const SELECTORS = {
        RESOLUTION_FORM: '#resolutionForm',
        EDIT_FORM: '#editForm',
        TITLE_INPUT: '#title',
        DESCRIPTION_INPUT: '#description',
        TARGET_DATE_INPUT: '#targetDate',
        REMINDER_INPUT: '#reminder',
        EDIT_ID: '#editId',
        EDIT_TITLE: '#editTitle',
        EDIT_DESCRIPTION: '#editDescription',
        EDIT_TARGET_DATE: '#editTargetDate',
        EDIT_REMINDER: '#editReminder',
        RESOLUTION_LIST: '#resolutionList',
        STARS_CONTAINER: '#stars',
        VICTORY_OVERLAY: '#victoryOverlay',
        VICTORY_MESSAGE: '#victoryMessage',
        EDIT_MODAL: '#editModal',
        HIGH_SCORE: '#highScore',
        SCORE: '#score',
        MODE_RESOLUTIONS: '#modeResolutions',
        MODE_PONG: '#modePong',
        FLIP_BUTTON: '#flipButton',
        PONG_CANVAS: '#pongCanvas',
    };

    const MESSAGES = {
        CONFIRM_DELETE: '🎮 GAME OVER pour cette quête?\n\nVeux-tu vraiment supprimer cette résolution?',
        VICTORY_NEW: 'NOUVELLE QUÊTE AJOUTÉE!',
        VICTORY_COMPLETE: '🏆 QUÊTE ACCOMPLIE! +1000 PTS 🏆',
        VICTORY_UPDATE: '📝 QUÊTE MISE À JOUR!',
        COMPLETED: '✅ MISSION ACCOMPLIE!',
        OVERDUE: (days) => `⚠️ DÉPASSÉ DE ${days} JOURS!`,
        TODAY: "🔥 C'EST AUJOURD'HUI!",
        TOMORROW: '⏰ DEMAIN!',
        DAYS_LEFT: (days) => `📅 ${days} JOURS RESTANTS`,
        EMPTY_TITLE: 'AUCUNE QUÊTE EN COURS!',
        EMPTY_SUBTITLE: "AJOUTE TA PREMIÈRE RÉSOLUTION POUR COMMENCER L'AVENTURE!",
    };

    const PARTICLE_EMOJIS = ['🎉', '⭐', '🎮', '🏆', '💫', '🎊', '✨', '🌟'];

    const FUNNY_MESSAGES = [
        "🦄 Tu es plus beau/belle qu'une licorne qui fait du surf!",
        "🚀 NASA t'appelle, ils veulent savoir comment tu fais pour être aussi génial(e)!",
        "🎸 Chuck Norris a peur de tes résolutions!",
        "🍕 Une pizza vient d'être commandée en ton honneur quelque part dans le monde!",
        "🦸 Si les super-héros existaient, ils te demanderaient des conseils!",
        "🎪 Le cirque a appelé, ils veulent que tu sois leur nouvelle attraction: L'HUMAIN INCROYABLE!",
        "🌈 Un arc-en-ciel vient d'apparaître juste pour toi!",
        "🦖 Les dinosaures se sont éteints car ils n'avaient pas tes résolutions!",
        "🎩 Abracadabra! Tu es maintenant 10% plus awesome!",
        "🐙 Un poulpe applaudit quelque part avec ses 8 tentacules!",
        "🥁 Pourquoi le 8 a peur du 7? Parce que 7, 8, 9! ...Je sors.",
        "🧀 Qu'est-ce qu'un canif? Un petit fien! OK je sors vraiment.",
        "🐔 Pourquoi les plongeurs plongent en arrière? Parce que sinon ils tomberaient dans le bateau!",
        "🍌 Une banane entre dans un bar... et glisse. Voilà.",
        "🎺 Comment appelle-t-on un chat tombé dans un pot de peinture? Un chat peint!",
        "🔮 Je vois... je vois... que tu vas cliquer sur un autre bouton!",
        "🌟 Les astres disent: 'Arrête de cliquer et fais tes résolutions!'",
        "🎱 La boule magique dit: 'Réessaie plus tard' ... ah non ça c'est pour les questions.",
        "🦒 Une girafe peut nettoyer ses oreilles avec sa langue. De rien.",
        "🐌 Les escargots peuvent dormir 3 ans. Objectif de vie?",
        "🍯 Le miel ne périme jamais. Comme ta motivation! ...Non?",
        "🦑 Les calmars ont 3 cœurs. Toi t'en as qu'un mais il est ÉNORME!",
        "👾 BOOP BEEP BOOP! Je suis un bouton heureux!",
        "🎮 +100 points de procrastination!",
        "🌭 Ce message est sponsorisé par les hot-dogs de l'espace.",
        "🤖 *bruit de robot content*",
        "🎪 Félicitations! Tu as débloqué... ce message!",
        "🦆 COIN COIN! (ça veut dire 'bien joué' en canard)",
        "🌮 Taco Tuesday, même si on n'est pas mardi!",
        "🎸 *air guitar intensifies*",
    ];

    const KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const PONG_MESSAGES = {
        START: "APPUIE SUR ESPACE POUR COMMENCER!",
        PLAYER_WIN: "🏆 TU AS GAGNÉ! 🏆",
        CPU_WIN: "💀 GAME OVER! L'IA A GAGNÉ! 💀",
    };

    // ==========================================================================
    // UTILITAIRES
    // ==========================================================================

    function $(selector) {
        return document.querySelector(selector);
    }

    function generateId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function getDaysRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        now.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    }

    function getProgress(createdAt, targetDate) {
        const created = new Date(createdAt);
        const target = new Date(targetDate);
        const now = new Date();
        const total = target - created;
        const elapsed = now - created;
        if (total <= 0) return 100;
        if (elapsed <= 0) return 0;
        if (elapsed >= total) return 100;
        return Math.round((elapsed / total) * 100);
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getTodayISO() {
        return new Date().toISOString().split('T')[0];
    }

    function randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ==========================================================================
    // STORAGE
    // ==========================================================================

    const storage = {
        getAll() {
            try {
                const data = localStorage.getItem(CONFIG.STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('[Storage] Erreur:', e);
                return [];
            }
        },

        getById(id) {
            return this.getAll().find(r => r.id === id) || null;
        },

        saveAll(resolutions) {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(resolutions));
                return true;
            } catch (e) {
                console.error('[Storage] Erreur:', e);
                return false;
            }
        },

        add(resolution) {
            const all = this.getAll();
            all.push(resolution);
            return this.saveAll(all);
        },

        update(id, updates) {
            const all = this.getAll();
            const index = all.findIndex(r => r.id === id);
            if (index === -1) return false;
            all[index] = { ...all[index], ...updates };
            return this.saveAll(all);
        },

        delete(id) {
            const all = this.getAll();
            return this.saveAll(all.filter(r => r.id !== id));
        },

        getCompletedCount() {
            return this.getAll().filter(r => r.completed).length;
        },

        getTotalCount() {
            return this.getAll().length;
        }
    };

    // ==========================================================================
    // UI MANAGER
    // ==========================================================================

    const ui = {
        elements: {},

        cacheElements() {
            this.elements = {
                resolutionList: $(SELECTORS.RESOLUTION_LIST),
                starsContainer: $(SELECTORS.STARS_CONTAINER),
                victoryOverlay: $(SELECTORS.VICTORY_OVERLAY),
                victoryMessage: $(SELECTORS.VICTORY_MESSAGE),
                editModal: $(SELECTORS.EDIT_MODAL),
                highScore: $(SELECTORS.HIGH_SCORE),
                score: $(SELECTORS.SCORE),
                targetDateInput: $(SELECTORS.TARGET_DATE_INPUT),
                reminderInput: $(SELECTORS.REMINDER_INPUT),
            };
        },

        initEffects() {
            this.cacheElements();
            this.createStars();
            this.initDateInputs();
        },

        createStars() {
            const container = this.elements.starsContainer;
            if (!container) return;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < CONFIG.STARS_COUNT; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const size = randomInRange(1, 3);
                star.style.cssText = `
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    width: ${size}px;
                    height: ${size}px;
                    animation-delay: ${Math.random() * 2}s;
                `;
                fragment.appendChild(star);
            }
            container.appendChild(fragment);
        },

        initDateInputs() {
            const today = getTodayISO();
            const input = this.elements.targetDateInput;
            if (input) {
                input.min = today;
                input.value = today;
            }
        },

        updateScores(total, completed) {
            if (this.elements.highScore) {
                this.elements.highScore.textContent = total;
            }
            if (this.elements.score) {
                this.elements.score.textContent = completed * CONFIG.POINTS_PER_COMPLETION;
            }
        },

        showVictory(message) {
            const overlay = this.elements.victoryOverlay;
            const messageEl = this.elements.victoryMessage;
            if (!overlay) return;
            if (messageEl) messageEl.textContent = message;
            overlay.classList.add('is-visible');
            overlay.setAttribute('aria-hidden', 'false');
            this.createParticles();
            setTimeout(() => this.hideVictory(), CONFIG.VICTORY_DISPLAY_DURATION);
        },

        hideVictory() {
            const overlay = this.elements.victoryOverlay;
            if (overlay) {
                overlay.classList.remove('is-visible');
                overlay.setAttribute('aria-hidden', 'true');
            }
        },

        createParticles() {
            for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.textContent = PARTICLE_EMOJIS[randomInRange(0, PARTICLE_EMOJIS.length - 1)];
                    particle.style.left = `${Math.random() * 100}vw`;
                    particle.style.top = '-50px';
                    document.body.appendChild(particle);
                    setTimeout(() => particle.remove(), 2000);
                }, i * CONFIG.PARTICLE_SPAWN_DELAY);
            }
        },

        createFunParticles() {
            const emojis = ['🎉', '🎊', '✨', '💥', '🌟', '⚡', '🔥', '💫', '🎮', '🕹️'];
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.textContent = emojis[randomInRange(0, emojis.length - 1)];
                    particle.style.left = `${Math.random() * 100}vw`;
                    particle.style.top = '-50px';
                    document.body.appendChild(particle);
                    setTimeout(() => particle.remove(), 2000);
                }, i * 50);
            }
        },

        openEditModal(resolution) {
            const modal = this.elements.editModal;
            if (!modal) return;
            $(SELECTORS.EDIT_ID).value = resolution.id;
            $(SELECTORS.EDIT_TITLE).value = resolution.title;
            $(SELECTORS.EDIT_DESCRIPTION).value = resolution.description || '';
            $(SELECTORS.EDIT_TARGET_DATE).value = resolution.targetDate;
            $(SELECTORS.EDIT_REMINDER).value = resolution.reminder;
            modal.classList.add('is-visible');
            modal.setAttribute('aria-hidden', 'false');
            $(SELECTORS.EDIT_TITLE)?.focus();
        },

        closeEditModal() {
            const modal = this.elements.editModal;
            if (modal) {
                modal.classList.remove('is-visible');
                modal.setAttribute('aria-hidden', 'true');
            }
        },

        getDeadlineInfo(resolution) {
            if (resolution.completed) {
                return { text: MESSAGES.COMPLETED, isUrgent: false };
            }
            const daysLeft = getDaysRemaining(resolution.targetDate);
            if (daysLeft < 0) return { text: MESSAGES.OVERDUE(Math.abs(daysLeft)), isUrgent: true };
            if (daysLeft === 0) return { text: MESSAGES.TODAY, isUrgent: true };
            if (daysLeft === 1) return { text: MESSAGES.TOMORROW, isUrgent: true };
            return { text: MESSAGES.DAYS_LEFT(daysLeft), isUrgent: daysLeft <= resolution.reminder };
        },

        renderCard(resolution) {
            const { text: deadlineText, isUrgent } = this.getDeadlineInfo(resolution);
            const progress = resolution.completed ? 100 : getProgress(resolution.createdAt, resolution.targetDate);
            const cardClass = resolution.completed ? 'resolution-card--completed' : '';
            const titleClass = resolution.completed ? 'resolution-card__title--completed' : '';
            const deadlineClass = isUrgent ? 'resolution-card__deadline--urgent' : '';

            return `
                <article class="resolution-card ${cardClass}" role="listitem" data-id="${resolution.id}">
                    <header class="resolution-card__header">
                        <h3 class="resolution-card__title ${titleClass}">${escapeHtml(resolution.title)}</h3>
                        <span class="resolution-card__deadline ${deadlineClass}">${deadlineText}</span>
                    </header>
                    ${resolution.description ? `<p class="resolution-card__description">${escapeHtml(resolution.description)}</p>` : ''}
                    <div class="progress">
                        <div class="progress__bar">
                            <div class="progress__fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="progress__text">PROGRESSION: ${progress}% | OBJECTIF: ${formatDate(resolution.targetDate)}</p>
                    </div>
                    <div class="resolution-card__actions">
                        ${!resolution.completed ? `<button class="btn btn--small btn--complete" data-action="complete" data-id="${resolution.id}">✅ ACCOMPLIR</button>` : ''}
                        <button class="btn btn--small btn--edit" data-action="edit" data-id="${resolution.id}">✏️ MODIFIER</button>
                        <button class="btn btn--small btn--delete" data-action="delete" data-id="${resolution.id}">🗑️ SUPPRIMER</button>
                    </div>
                </article>
            `;
        },

        renderResolutions(resolutions) {
            const container = this.elements.resolutionList;
            if (!container) return;

            if (resolutions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-state__icon">🪙</span>
                        ${MESSAGES.EMPTY_TITLE}<br><br>
                        ${MESSAGES.EMPTY_SUBTITLE}
                    </div>
                `;
                return;
            }

            const sorted = [...resolutions].sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date(a.targetDate) - new Date(b.targetDate);
            });

            container.innerHTML = sorted.map(res => this.renderCard(res)).join('');
        },

        resetForm() {
            const form = $(SELECTORS.RESOLUTION_FORM);
            if (form) {
                form.reset();
                this.initDateInputs();
                if (this.elements.reminderInput) {
                    this.elements.reminderInput.value = CONFIG.DEFAULT_REMINDER_DAYS;
                }
            }
        },

        triggerRainbowEffect() {
            document.body.style.animation = 'none';
            document.body.offsetHeight;
            document.body.style.animation = 'rainbow 2s';
            this.createParticles();
        }
    };

    // ==========================================================================
    // PONG GAME
    // ==========================================================================

    class PongGame {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.isRunning = false;
            this.isPaused = true;
            this.gameOver = false;
            this.animationId = null;

            this.width = 1000;
            this.height = 625;
            this.paddleHeight = 100;
            this.paddleWidth = 15;

            this.ball = { x: 400, y: 250, radius: 10, speedX: 0, speedY: 0 };
            this.playerY = 200;
            this.cpuY = 200;
            this.playerSpeed = 0;
            this.playerScore = 0;
            this.cpuScore = 0;

            this.colors = {
                background: '#0a0a12',
                paddle: '#00ffff',
                ball: '#ff00ff',
                net: '#333',
                text: '#ffff00',
                score: '#00ff00',
            };

            this.onGameEndCallback = null;
            this.setupCanvas();
            this.bindEvents();
        }

        setupCanvas() {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            if (!this.canvas) return;
            const container = this.canvas.parentElement;
            if (!container || container.clientWidth <= 0) return;
            
            // Écran plus grand - max 1000px de large
            const maxWidth = Math.min(container.clientWidth - 40, 1000);
            const ratio = 16 / 10; // Ratio plus large
            
            this.width = Math.max(maxWidth, 400);
            this.height = Math.max(this.width / ratio, 250);
            
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.paddleHeight = Math.max(this.height * 0.2, 50);
            this.ball.radius = Math.max(this.width * 0.0125, 5);
            
            if (!this.isRunning) this.draw();
        }

        bindEvents() {
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleKeyUp(e));
            if (this.canvas) {
                this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e));
                this.canvas.addEventListener('mousemove', (e) => this.handleMouse(e));
            }
        }

        handleKeyDown(e) {
            if (!this.isRunning) return;
            if (['ArrowUp', 'w', 'W'].includes(e.key)) {
                e.preventDefault();
                this.playerSpeed = -CONFIG.PONG_PADDLE_SPEED;
            } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
                e.preventDefault();
                this.playerSpeed = CONFIG.PONG_PADDLE_SPEED;
            } else if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            } else if (e.key === 'Escape') {
                this.stop();
            }
        }

        handleKeyUp(e) {
            if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
                this.playerSpeed = 0;
            }
        }

        handleTouch(e) {
            if (!this.isRunning || this.isPaused) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.playerY = e.touches[0].clientY - rect.top - this.paddleHeight / 2;
            this.clampPlayer();
        }

        handleMouse(e) {
            if (!this.isRunning || this.isPaused) return;
            const rect = this.canvas.getBoundingClientRect();
            this.playerY = e.clientY - rect.top - this.paddleHeight / 2;
            this.clampPlayer();
        }

        clampPlayer() {
            this.playerY = Math.max(0, Math.min(this.height - this.paddleHeight, this.playerY));
        }

        togglePause() {
            if (this.gameOver) {
                this.reset();
                return;
            }
            this.isPaused = !this.isPaused;
            if (!this.isPaused) this.gameLoop();
        }

        start() {
            this.reset();
            this.isRunning = true;
            this.isPaused = true;
            this.gameOver = false;
            this.draw();
        }

        stop() {
            this.isRunning = false;
            this.isPaused = true;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        reset() {
            this.playerScore = 0;
            this.cpuScore = 0;
            this.gameOver = false;
            this.isPaused = true;
            this.resetBall();
            this.playerY = this.height / 2 - this.paddleHeight / 2;
            this.cpuY = this.height / 2 - this.paddleHeight / 2;
        }

        resetBall() {
            this.ball.x = this.width / 2;
            this.ball.y = this.height / 2;
            const angle = (Math.random() - 0.5) * Math.PI / 2;
            const dir = Math.random() > 0.5 ? 1 : -1;
            this.ball.speedX = dir * CONFIG.PONG_BALL_SPEED * Math.cos(angle);
            this.ball.speedY = CONFIG.PONG_BALL_SPEED * Math.sin(angle);
        }

        gameLoop() {
            if (!this.isRunning || this.isPaused) return;
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }

        update() {
            this.playerY += this.playerSpeed;
            this.clampPlayer();

            // CPU AI
            const cpuCenter = this.cpuY + this.paddleHeight / 2;
            const speed = CONFIG.PONG_PADDLE_SPEED * 0.7;
            if (cpuCenter < this.ball.y - 20) this.cpuY += speed;
            else if (cpuCenter > this.ball.y + 20) this.cpuY -= speed;
            this.cpuY = Math.max(0, Math.min(this.height - this.paddleHeight, this.cpuY));

            // Ball movement
            this.ball.x += this.ball.speedX;
            this.ball.y += this.ball.speedY;

            // Wall collision
            if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.height) {
                this.ball.speedY *= -1;
                this.ball.y = Math.max(this.ball.radius, Math.min(this.height - this.ball.radius, this.ball.y));
            }

            // Player paddle collision
            if (this.ball.x - this.ball.radius <= this.paddleWidth + 20 &&
                this.ball.y >= this.playerY && this.ball.y <= this.playerY + this.paddleHeight &&
                this.ball.speedX < 0) {
                this.ball.speedX *= -1.1;
                this.ball.x = this.paddleWidth + 20 + this.ball.radius;
                this.ball.speedY = ((this.ball.y - this.playerY) / this.paddleHeight - 0.5) * 10;
            }

            // CPU paddle collision
            if (this.ball.x + this.ball.radius >= this.width - this.paddleWidth - 20 &&
                this.ball.y >= this.cpuY && this.ball.y <= this.cpuY + this.paddleHeight &&
                this.ball.speedX > 0) {
                this.ball.speedX *= -1.1;
                this.ball.x = this.width - this.paddleWidth - 20 - this.ball.radius;
                this.ball.speedY = ((this.ball.y - this.cpuY) / this.paddleHeight - 0.5) * 10;
            }

            // Speed limit
            const maxSpeed = 15;
            this.ball.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.speedX));
            this.ball.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.speedY));

            // Scoring
            if (this.ball.x < 0) {
                this.cpuScore++;
                this.checkWin();
                this.resetBall();
            } else if (this.ball.x > this.width) {
                this.playerScore++;
                this.checkWin();
                this.resetBall();
            }
        }

        checkWin() {
            if (this.playerScore >= CONFIG.PONG_WINNING_SCORE) {
                this.gameOver = true;
                this.isPaused = true;
                if (this.onGameEndCallback) this.onGameEndCallback('player');
            } else if (this.cpuScore >= CONFIG.PONG_WINNING_SCORE) {
                this.gameOver = true;
                this.isPaused = true;
                if (this.onGameEndCallback) this.onGameEndCallback('cpu');
            }
        }

        draw() {
            if (!this.ctx || this.width <= 0 || this.height <= 0 || this.ball.radius <= 0) return;
            const ctx = this.ctx;

            // Background
            ctx.fillStyle = this.colors.background;
            ctx.fillRect(0, 0, this.width, this.height);

            // Net
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = this.colors.net;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.width / 2, 0);
            ctx.lineTo(this.width / 2, this.height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Scores
            ctx.fillStyle = this.colors.score;
            ctx.font = `${this.width * 0.05}px "Press Start 2P", monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(this.playerScore.toString(), this.width * 0.25, this.height * 0.15);
            ctx.fillText(this.cpuScore.toString(), this.width * 0.75, this.height * 0.15);

            // Labels
            ctx.font = `${this.width * 0.02}px "Press Start 2P", monospace`;
            ctx.fillStyle = this.colors.text;
            ctx.fillText('TOI', this.width * 0.25, this.height * 0.08);
            ctx.fillText('CPU', this.width * 0.75, this.height * 0.08);

            // Paddles with glow
            ctx.shadowColor = this.colors.paddle;
            ctx.shadowBlur = 20;
            ctx.fillStyle = this.colors.paddle;
            ctx.fillRect(20, this.playerY, this.paddleWidth, this.paddleHeight);
            ctx.fillRect(this.width - 20 - this.paddleWidth, this.cpuY, this.paddleWidth, this.paddleHeight);

            // Ball with glow
            ctx.shadowColor = this.colors.ball;
            ctx.fillStyle = this.colors.ball;
            ctx.beginPath();
            ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Messages
            if (this.isPaused && !this.gameOver) {
                this.drawMessage(PONG_MESSAGES.START);
            } else if (this.gameOver) {
                const msg = this.playerScore >= CONFIG.PONG_WINNING_SCORE ? PONG_MESSAGES.PLAYER_WIN : PONG_MESSAGES.CPU_WIN;
                this.drawMessage(msg + '\n\nESPACE POUR REJOUER');
            }

            // Instructions
            if (!this.gameOver) {
                ctx.font = `${this.width * 0.015}px "Press Start 2P", monospace`;
                ctx.fillStyle = '#666';
                ctx.fillText('↑↓ ou W/S pour bouger | ESPACE pour pause', this.width / 2, this.height - 20);
            }
        }

        drawMessage(text) {
            const ctx = this.ctx;
            const lines = text.split('\n');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.font = `${this.width * 0.025}px "Press Start 2P", monospace`;
            ctx.fillStyle = this.colors.text;
            ctx.textAlign = 'center';
            lines.forEach((line, i) => {
                ctx.fillText(line, this.width / 2, this.height / 2 + (i - lines.length / 2) * 40);
            });
        }

        onGameEnd(callback) {
            this.onGameEndCallback = callback;
        }
    }

    // ==========================================================================
    // APPLICATION PRINCIPALE
    // ==========================================================================

    class ResolutionApp {
        constructor() {
            this.konamiBuffer = [];
            this.pongGame = null;
            this.currentMode = 'resolutions';
            this.init();
        }

        init() {
            this.bindEvents();
            this.setupDelegatedEvents();
            this.setupFunButtons();
            this.setupFlipButton();
            this.initPong();
            ui.initEffects();
            this.refresh();
            this.logWelcome();
        }

        bindEvents() {
            $(SELECTORS.RESOLUTION_FORM)?.addEventListener('submit', (e) => this.handleAddSubmit(e));
            $(SELECTORS.EDIT_FORM)?.addEventListener('submit', (e) => this.handleEditSubmit(e));

            $(SELECTORS.EDIT_MODAL)?.addEventListener('click', (e) => {
                if (e.target === $(SELECTORS.EDIT_MODAL) || e.target.closest('[data-action="close-modal"]')) {
                    ui.closeEditModal();
                }
            });

            $(SELECTORS.VICTORY_OVERLAY)?.addEventListener('click', () => ui.hideVictory());

            $('#funnyOverlay')?.addEventListener('click', (e) => {
                if (e.target === $('#funnyOverlay') || e.target.closest('.funny-bubble__close')) {
                    this.hideFunnyMessage();
                }
            });

            document.addEventListener('keydown', (e) => {
                this.handleKonami(e);
                if (e.key === 'Escape') {
                    ui.closeEditModal();
                    ui.hideVictory();
                    this.hideFunnyMessage();
                }
            });
        }

        setupDelegatedEvents() {
            $(SELECTORS.RESOLUTION_LIST)?.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                const { action, id } = btn.dataset;
                if (action === 'complete') this.completeResolution(id);
                else if (action === 'edit') this.openEditModal(id);
                else if (action === 'delete') this.deleteResolution(id);
            });
        }

        setupFunButtons() {
            document.querySelectorAll('[data-action="funny"]').forEach(btn => {
                btn.addEventListener('click', () => this.showFunnyMessage());
            });
        }

        showFunnyMessage() {
            const message = FUNNY_MESSAGES[randomInRange(0, FUNNY_MESSAGES.length - 1)];
            const overlay = $('#funnyOverlay');
            const messageEl = $('#funnyMessage');
            if (overlay && messageEl) {
                messageEl.textContent = message;
                overlay.classList.add('is-visible');
                overlay.setAttribute('aria-hidden', 'false');
                ui.createFunParticles();
            }
        }

        hideFunnyMessage() {
            const overlay = $('#funnyOverlay');
            if (overlay) {
                overlay.classList.remove('is-visible');
                overlay.setAttribute('aria-hidden', 'true');
            }
        }

        setupFlipButton() {
            $(SELECTORS.FLIP_BUTTON)?.addEventListener('click', () => this.toggleMode());
        }

        toggleMode() {
            const resMode = $(SELECTORS.MODE_RESOLUTIONS);
            const pongMode = $(SELECTORS.MODE_PONG);
            const flipBtn = $(SELECTORS.FLIP_BUTTON);
            if (!resMode || !pongMode || !flipBtn) return;

            if (this.currentMode === 'resolutions') {
                this.currentMode = 'pong';
                resMode.classList.add('is-hidden');
                pongMode.classList.remove('is-hidden');
                flipBtn.querySelector('.flip-button__icon').textContent = '📝';
                flipBtn.querySelector('.flip-button__text').textContent = 'RÉSOLUTIONS!';
                // Afficher le bouton Start, ne pas démarrer automatiquement
                this.showPongStartButton();
                this.pongGame?.resizeCanvas();
            } else {
                this.currentMode = 'resolutions';
                pongMode.classList.add('is-hidden');
                resMode.classList.remove('is-hidden');
                flipBtn.querySelector('.flip-button__icon').textContent = '🕹️';
                flipBtn.querySelector('.flip-button__text').textContent = 'PONG!';
                this.pongGame?.stop();
            }
            ui.createFunParticles();
        }

        initPong() {
            this.pongGame = new PongGame('pongCanvas');
            this.pongGame.onGameEnd((winner) => {
                if (winner === 'player') {
                    ui.showVictory('🏓 TU AS BATTU L\'IA! +500 PTS! 🏓');
                }
                // Réafficher le bouton Start après game over
                this.showPongStartButton();
            });
            
            // Bouton Start
            const startBtn = $('#pongStartBtn');
            startBtn?.addEventListener('click', () => this.startPongGame());
        }
        
        startPongGame() {
            const overlay = $('#pongStartOverlay');
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            this.pongGame?.start();
            // Démarrer immédiatement (ne pas attendre ESPACE)
            if (this.pongGame) {
                this.pongGame.isPaused = false;
                this.pongGame.gameLoop();
            }
        }
        
        showPongStartButton() {
            const overlay = $('#pongStartOverlay');
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        }

        refresh() {
            ui.renderResolutions(storage.getAll());
            ui.updateScores(storage.getTotalCount(), storage.getCompletedCount());
        }

        handleAddSubmit(e) {
            e.preventDefault();
            const data = {
                title: $(SELECTORS.TITLE_INPUT)?.value.trim(),
                description: $(SELECTORS.DESCRIPTION_INPUT)?.value.trim() || '',
                targetDate: $(SELECTORS.TARGET_DATE_INPUT)?.value,
                reminder: parseInt($(SELECTORS.REMINDER_INPUT)?.value) || CONFIG.DEFAULT_REMINDER_DAYS,
            };
            if (!data.title || !data.targetDate) return;

            storage.add({
                id: generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                completed: false,
            });
            this.refresh();
            ui.resetForm();
            ui.showVictory(MESSAGES.VICTORY_NEW);
        }

        handleEditSubmit(e) {
            e.preventDefault();
            const id = $(SELECTORS.EDIT_ID)?.value;
            if (!id) return;

            const updates = {
                title: $(SELECTORS.EDIT_TITLE)?.value.trim(),
                description: $(SELECTORS.EDIT_DESCRIPTION)?.value.trim() || '',
                targetDate: $(SELECTORS.EDIT_TARGET_DATE)?.value,
                reminder: parseInt($(SELECTORS.EDIT_REMINDER)?.value) || CONFIG.DEFAULT_REMINDER_DAYS,
            };
            if (!updates.title || !updates.targetDate) return;

            storage.update(id, updates);
            this.refresh();
            ui.closeEditModal();
            ui.showVictory(MESSAGES.VICTORY_UPDATE);
        }

        openEditModal(id) {
            const res = storage.getById(id);
            if (res) ui.openEditModal(res);
        }

        completeResolution(id) {
            storage.update(id, { completed: true, completedAt: new Date().toISOString() });
            this.refresh();
            ui.showVictory(MESSAGES.VICTORY_COMPLETE);
        }

        deleteResolution(id) {
            if (confirm(MESSAGES.CONFIRM_DELETE)) {
                storage.delete(id);
                this.refresh();
            }
        }

        handleKonami(e) {
            this.konamiBuffer.push(e.key);
            this.konamiBuffer = this.konamiBuffer.slice(-KONAMI_SEQUENCE.length);
            if (this.konamiBuffer.join(',') === KONAMI_SEQUENCE.join(',')) {
                ui.triggerRainbowEffect();
                alert('🎮 CHEAT CODE ACTIVÉ! 🎮\n\n+9999 POINTS DE MOTIVATION!\n\nTU VAS ACCOMPLIR TOUTES TES RÉSOLUTIONS!');
                this.konamiBuffer = [];
            }
        }

        logWelcome() {
            console.log('%c🎮 RÉSOLUTIONS ARCADE 2025 🎮', 'font-size: 20px; color: #ff00ff; font-weight: bold;');
            console.log('%cBonne année et bonne chance avec tes résolutions!', 'font-size: 14px; color: #00ffff;');
            console.log('%c💡 Astuce: Essaie le code Konami! ↑↑↓↓←→←→BA', 'font-size: 12px; color: #ffff00;');
            console.log('%c🕹️ Clique sur le bouton PONG en bas à droite pour jouer!', 'font-size: 12px; color: #00ff00;');
        }
    }

    // Démarrage
    document.addEventListener('DOMContentLoaded', () => new ResolutionApp());

})();
