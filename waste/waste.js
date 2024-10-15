
        // // Timer function
        // let timeLeft = 60;
        // const timerElement = document.getElementById('timer');
        // const resendLink = document.getElementById('resendLink');
    
        // const countdown = setInterval(() => {
        //     timeLeft--;
        //     timerElement.textContent = `Resend OTP in: ${timeLeft} seconds`;
    
        //     if (timeLeft <= 0) {
        //         clearInterval(countdown);
        //         timerElement.style.display = 'none';
        //         resendLink.style.display = 'block';
        //     }
        // }, 1000);
    
        // // Form submission handler
        // document.getElementById('verificationForm').addEventListener('submit', function(event) {
        //     event.preventDefault();
        //     const otp = document.getElementById('otp').value;
    
        //     // Make an API call to verify OTP (use AJAX/fetch for a real-world application)
        //     console.log('OTP submitted:', otp);
    
        //     // Add your OTP verification logic here
        // });
    
        // // Resend OTP handler
        // resendLink.addEventListener('click', function() {
        //     console.log('Resend OTP clicked');
        //     // Logic to resend OTP
        //     timeLeft = 60; // Reset timer
        //     resendLink.style.display = 'none';
        //     timerElement.style.display = 'block';
        //     countdown; // Restart the countdown
        // });