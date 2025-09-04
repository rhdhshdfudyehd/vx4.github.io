$(function() {
    $('.mobile-menu-btn').click(function() {
        $('.mobile-nav').addClass('active');
        $('.mobile-overlay').addClass('active');
    });

    $('.mobile-nav-close, .mobile-overlay').click(function() {
        $('.mobile-nav').removeClass('active');
        $('.mobile-overlay').removeClass('active');
    });

    $('.mobile-nav-item a').click(function() {
        $('.mobile-nav').removeClass('active');
        $('.mobile-overlay').removeClass('active');
    });

    const defaultOptions = {duration: 4000, showClose: true, showProgress: true, position: 'top-right'},
        iconMap = {
        success: '<i class="fas fa-check"></i>',
        error: '<i class="fa fa-times"></i>',
        warning: '<i class="fa fa-exclamation-triangle"></i>',
        info: '<i class="fa fa-exclamation-circle"></i>'
    },
        totalEle = $('#totalAmount'),
        quantityEle = $('#quantity'),
        paymentModalEle = $('#paymentModal'),
        price = parseFloat(totalEle.attr('data-price'));

    function createToast(type, title, message, options) {
        const opts = $.extend({}, defaultOptions, options);
        const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const toastHtml = `<div class="toast ${type}"id="${toastId}"><div class="toast-icon">${iconMap[type] || iconMap.info}</div><div class="toast-content">${title ? `<div class="toast-title">${title}</div>` : ''}<div class="toast-message">${message}</div></div>${opts.showClose ? '<button class="toast-close" onclick="closeToast(\'' + toastId + '\')">&times;</button>' : ''}${opts.showProgress ? `<div class="toast-progress"style="animation-duration: ${opts.duration}ms;"></div>` : ''}</div>`;
        return {id: toastId, html: toastHtml, duration: opts.duration}
    }

    function toast(type, title, message, options) {
        const toast = createToast(type, title, message, options);
        const $container = $('#toastContainer');
        if ($container.length === 0) {
            $('body').append('<div class="toast-container" id="toastContainer"></div>');
        }
        $('#toastContainer').append(toast.html);
        const $toast = $('#' + toast.id);
        setTimeout(() => {
            $toast.addClass('show');
        }, 10);
        if (toast.duration > 0) {
            setTimeout(() => {
                closeToast(toast.id);
            }, toast.duration);
        }
        return toast.id;
    }

    window.closeToast = function (toastId) {
        const $toast = $('#' + toastId);
        if ($toast.length) {
            $toast.removeClass('show');
            setTimeout(() => {
                $toast.remove();
            }, 300);
        }
    };

    function updateTotal() {
        const quantity = parseInt(quantityEle.val());
        totalEle.text('$' + (quantity * price).toFixed(2));
    }

    $('#decrease').click(function() {
        const currentValue = parseInt(quantityEle.val());
        if (currentValue > 1) {
            quantityEle.val(currentValue - 1);
            updateTotal();
        }
    });

    $('#increase').click(function() {
        const currentValue = parseInt(quantityEle.val());
        if (currentValue < 1000) {
            quantityEle.val(currentValue + 1);
            updateTotal();
        }
    });

    quantityEle.on('input', function() {
        const value = parseInt($(this).val());
        if (value >= 1 && value <= 1000) {
            updateTotal();
        }
    });

    $('.buy-button').click(function() {
        const email = $('#email').val();
        const quantity = parseInt($('#quantity').val());
        if (!email || !isValidEmail(email)) {
            $('#email').focus();
            toast('error', '', '请输入正确的邮箱地址');
            return;
        }

        $('#orderQuantity').text(quantity + '个');
        $('#paymentAmount').text('$' + (quantity * price).toFixed(2));
        $('#paymentPrice').text('$' + (price).toFixed(2));
        paymentModalEle.addClass('show').css('display', 'flex');
        $('body').css('overflow', 'hidden');
    });

    function closePaymentModal() {
        paymentModalEle.removeClass('show').css('display', 'none');
        $('body').css('overflow', 'auto');
    }

    $('#closeModal').click(closePaymentModal);

    paymentModalEle.click(function(e) {
        if (e.target === this) {
            closePaymentModal();
        }
    });

    $('.payment-option').click(function() {
        $('.payment-option').removeClass('selected');
        $(this).addClass('selected');
        var method = $(this).data('method');
        updatePaymentAddress(method);
        $('.address-container').addClass('fade-in');
        setTimeout(() => {
            $('.address-container').removeClass('fade-in');
        }, 500);
    });

    function updatePaymentAddress(method) {
        var addresses = {
            'usdt-trc20': 'TCz8hQirLYwhaaNcDtDdkpoi49Kirrcg2V',
            'usdt-erc20': '0xE0Cd59dfB0018D1Cf907DBc1a1F013fF678F7F9a',
            'usdt-bep20': '0xE0Cd59dfB0018D1Cf907DBc1a1F013fF678F7F9a',
            'usdt-sol': '99nRRoJYdYHYwuccWm3vGE8nLYtgYZTKQXTa2scMUgL2'
        }, network = (method.toUpperCase()).split('-');

        $('.network_type').text(network[0] +' '+ network[1]);
        $('#walletAddress').text(addresses[method]);
        $('#qr-code').empty();
        if(typeof QRCode !== "undefined"){
            new QRCode('qr-code', {
                text: addresses[method],
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        $('.copy-btn').attr('data-clipboard-text', addresses[method]);
    }

    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function readingProgress() {
        const progressBar = $('<div class="reading-progress"></div>');
        progressBar.css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '0%',
            'height': '3px',
            'background': 'linear-gradient(90deg, rgb(255, 91, 0), rgb(230, 82, 0))',
            'z-index': '9999',
            'transition': 'width 0.3s ease'
        });
        $('body').prepend(progressBar);
        $(window).scroll(function () {
            const winScroll = $(this).scrollTop();
            const height = $(document).height() - $(window).height();
            const scrolled = (winScroll / height) * 100;
            progressBar.css('width', scrolled + '%');
        });
    }

    if(typeof ClipboardJS !== 'undefined'){
        var clipboard = new ClipboardJS('.copy-btn');
        clipboard.on('success', function (e) {
            toast('success', '', '复制充值地址成功');
            e.clearSelection();
        });
    }

    updateTotal();
    updatePaymentAddress('usdt-trc20');
    readingProgress();
});