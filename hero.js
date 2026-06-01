        document.addEventListener('DOMContentLoaded', () => {

            const mediaAssets = [
                {
                    type: 'image',
                    url: 'https://png.pngtree.com/thumb_back/fh260/background/20240618/pngtree-roller-road-construction-image_15798332.jpg'
                },
                // {
                //     type: 'video',
                //     url: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/q_auto,f_auto/highway-construction-1.mp4'
                // },
                {
                    type: 'image',
                    url: 'https://etimg.etb2bimg.com/photo/124249718.cms'
                },
                {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1529792083865-d23889753466?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                },
                // {
                //     type: 'video',
                //     url: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/q_auto,f_auto/highway-construction-2.mp4'
                // },
                {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1601950453142-c32d72005f29?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                },
                {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1529792083865-d23889753466?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
            ];

            const bgContainer = document.getElementById('hero-bg-container');
            const overlay = bgContainer.querySelector('.z-10');

            let currentIndex = 0;
            let slideTimeout;

            const slideElements = mediaAssets.map(asset => {

                const element = document.createElement(
                    asset.type === 'video' ? 'video' : 'img'
                );

                element.className =
                    'absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out';

                if (asset.type === 'video') {
                    element.muted = true;
                    element.playsInline = true;
                    element.preload = 'none';
                }

                bgContainer.insertBefore(element, overlay);

                return element;
            });

            function loadAsset(index) {

                const element = slideElements[index];
                const asset = mediaAssets[index];

                if (!element.src) {
                    element.src = asset.url;

                    if (asset.type === 'video') {
                        element.load();
                    }
                }
            }

            function showSlide(index) {

                clearTimeout(slideTimeout);

                slideElements.forEach(element => {

                    element.classList.remove('opacity-100');
                    element.classList.add('opacity-0');

                    if (element.tagName === 'VIDEO') {
                        element.pause();
                    }

                });

                loadAsset(index);

                const nextIndex = (index + 1) % mediaAssets.length;

                loadAsset(nextIndex);

                const currentElement = slideElements[index];

                currentElement.classList.remove('opacity-0');
                currentElement.classList.add('opacity-100');

                if (mediaAssets[index].type === 'video') {

                    currentElement.currentTime = 0;

                    currentElement.play().catch(() => {

                        slideTimeout = setTimeout(() => {
                            showSlide(nextIndex);
                        }, 2000);

                    });

                    currentElement.onended = () => {
                        showSlide(nextIndex);
                    };

                } else {

                    slideTimeout = setTimeout(() => {
                        showSlide(nextIndex);
                    }, 2000);

                }

                currentIndex = index;
            }

            showSlide(currentIndex);

        });