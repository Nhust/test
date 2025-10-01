$(document).ready(function() {
    var $inner = $('.inner'),
        $spin = $('#spin'),
        $reset = $('#reset'),
        $data = $('.data'),
        $mask = $('.mask'),
        maskDefault = 'Place Your Bets',
        timer = 9000;

    var red = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
    
    var currentBet = null;

    $mask.text(maskDefault);

    // Gestion de la sélection sur le tapis
    $('.bet-cell').on('click', function() {
        $('.bet-cell').removeClass('selected');
        $(this).addClass('selected');
        
        var betType = $(this).data('bet-type');
        var betValue = $(this).data('value');
        
        currentBet = {
            type: betType,
            value: betValue
        };
        
        var betDescription = getBetDescription(betType, betValue);
        $('#bet-description').text(betDescription);
        $('.bet-info').show();
    });

    function getBetDescription(type, value) {
        switch(type) {
            case 'number':
                return 'Numéro ' + value + ' (gain x36)';
            case 'color':
                return value === 'red' ? 'Rouge (gain x2)' : 'Noir (gain x2)';
            case 'even':
                return 'Pair (gain x2)';
            case 'odd':
                return 'Impair (gain x2)';
            case 'low':
                return '1-18 (gain x2)';
            case 'high':
                return '19-36 (gain x2)';
            case 'dozen':
                if(value == 1) return '1er douzaine (1-12) (gain x3)';
                if(value == 2) return '2ème douzaine (13-24) (gain x3)';
                if(value == 3) return '3ème douzaine (25-36) (gain x3)';
                break;
            case 'column':
                return 'Colonne ' + value + ' (gain x3)';
            default:
                return '';
        }
    }

    function checkWin(resultNumber, bet) {
        if (!bet) return false;
        
        var num = parseInt(resultNumber);
        
        switch(bet.type) {
            case 'number':
                return num === parseInt(bet.value);
            
            case 'color':
                if (num === 0) return false;
                var isRed = red.indexOf(num) !== -1;
                return (bet.value === 'red' && isRed) || (bet.value === 'black' && !isRed);
            
            case 'even':
                return num !== 0 && num % 2 === 0;
            
            case 'odd':
                return num !== 0 && num % 2 === 1;
            
            case 'low':
                return num >= 1 && num <= 18;
            
            case 'high':
                return num >= 19 && num <= 36;
            
            case 'dozen':
                if (bet.value == 1) return num >= 1 && num <= 12;
                if (bet.value == 2) return num >= 13 && num <= 24;
                if (bet.value == 3) return num >= 25 && num <= 36;
                return false;
            
            case 'column':
                if (num === 0) return false;
                var remainder = num % 3;
                if (remainder === 0) remainder = 3;
                return remainder === parseInt(bet.value);
            
            default:
                return false;
        }
    }

    function getGain(betType) {
        switch(betType) {
            case 'number':
                return 36;
            case 'dozen':
            case 'column':
                return 3;
            case 'color':
            case 'even':
            case 'odd':
            case 'low':
            case 'high':
                return 2;
            default:
                return 0;
        }
    }

    $spin.on('click', function() {
        if (!currentBet) {
            alert('Veuillez placer une mise avant de lancer la roulette !');
            return;
        }

        // Générer un numéro aléatoire entre 0 et 36
        var randomNumber = Math.floor(Math.random() * 37);
        var color = null;

        // Trouver l'index correct dans la liste (0 est le 37ème élément)
        var childIndex = randomNumber === 0 ? 37 : randomNumber;
        
        // Chercher l'élément avec la valeur correspondante
        $inner.find('input[value="' + randomNumber + '"]').prop('checked', 'checked');
        $inner.attr('data-spinto', randomNumber);

        // Cacher le bouton spin
        $(this).hide();

        // Désactiver le reset jusqu'à la fin
        $reset.addClass('disabled').prop('disabled', 'disabled').show();

        setTimeout(function() {
            $mask.text('No More Bets');
        }, timer / 2);

        setTimeout(function() {
            $mask.text(maskDefault);
        }, timer + 500);

        // Afficher le résultat
        setTimeout(function() {
            $reset.removeClass('disabled').prop('disabled', '');
            
            if ($.inArray(randomNumber, red) !== -1) {
                color = 'red';
            } else {
                color = 'black';
            }
            if (randomNumber === 0) {
                color = 'green';
            }

            $('.result-number').text(randomNumber);
            $('.result-color').text(color);
            $('.result').css({'background-color': '' + color + ''});
            $data.addClass('reveal');
            $inner.addClass('rest');

            var $thisResult = '<li class="previous-result color-' + color + '"><span class="previous-number">' + randomNumber + '</span><span class="previous-color">' + color + '</span></li>';
            $('.previous-list').prepend($thisResult);

            // Vérifier si le joueur a gagné
            var hasWon = checkWin(randomNumber, currentBet);
            var betDesc = getBetDescription(currentBet.type, currentBet.value);
            
            if (hasWon) {
                var gain = getGain(currentBet.type);
                $('.bet-info').html(
                    '<p style="color: gold; font-size: 28px; font-weight: bold;">🎉 VOUS AVEZ GAGNÉ ! 🎉</p>' +
                    '<p style="font-size: 20px; color: #90EE90;">Gain: x' + gain + '</p>' +
                    '<p>Votre mise : <strong>' + betDesc + '</strong></p>' +
                    '<p>Numéro gagnant : <strong>' + randomNumber + ' (' + color + ')</strong></p>'
                );
            } else {
                $('.bet-info').html(
                    '<p style="color: #ff6666; font-size: 24px; font-weight: bold;">❌ Perdu...</p>' +
                    '<p>Votre mise : <strong>' + betDesc + '</strong></p>' +
                    '<p>Numéro gagnant : <strong>' + randomNumber + ' (' + color + ')</strong></p>'
                );
            }
        }, timer);
    });

    $reset.on('click', function() {
        // Réinitialiser
        $inner.attr('data-spinto', '').removeClass('rest');
        $(this).hide();
        $spin.show();
        $data.removeClass('reveal');
        $('.bet-cell').removeClass('selected');
        currentBet = null;
        $('.bet-info').hide();
    });

    // Support du swipe avec Hammer.js
    var myElement = document.getElementById('plate');
    if (myElement && typeof Hammer !== 'undefined') {
        var mc = new Hammer(myElement);
        mc.on("swipe", function(ev) {
            if (!$reset.hasClass('disabled')) {
                if ($spin.is(':visible')) {
                    $spin.click();
                } else {
                    $reset.click();
                }
            }
        });
    }
});
