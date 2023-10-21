document.addEventListener("DOMContentLoaded", function () {
    const playButton = document.querySelector('.play');
    const pauseButton = document.querySelector('.pause');
    const progressBar = document.querySelector('.progress');

        let isPlaying = false;
        let currentTime = 0;
        const duration = 300; // Şarkının toplam süresi saniye cinsinden (örnek değer)

        playButton.addEventListener('click', () => {
            if (!isPlaying) {
                // Şarkı çalmaya başladığında ilerleme çubuğunu güncelle
                progressBar.style.transition = 'width 0.1s linear';
                playButton.classList.add('hidden');
                pauseButton.classList.remove('hidden');
                isPlaying = true;
                // Şarkı çalma işlemleri burada gerçekleştirilir
                // Örnek: audioElement.play();
            }
        });

        pauseButton.addEventListener('click', () => {
            if (isPlaying) {
                // Şarkı durdurulduğunda ilerleme çubuğunu güncelleme
                progressBar.style.transition = 'none';
                playButton.classList.remove('hidden');
                pauseButton.classList.add('hidden');
                isPlaying = false;
                // Şarkı durdurma işlemleri burada gerçekleştirilir
                // Örnek: audioElement.pause();
            }
        });

        // Şarkının ilerlemesi için bir zamanlayıcı oluşturun
        setInterval(() => {
            if (isPlaying) {
                currentTime += 1; // Örneğin her saniyede bir artırın
                const progressPercent = (currentTime / duration) * 100;
                progressBar.style.width = `${progressPercent}%`;
            }
        }, 1000); // Her saniyede bir güncelle
        });