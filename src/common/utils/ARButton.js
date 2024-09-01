class ARButton {

	static createButton(renderer, sessionInit = {}, texts = { startText: "Старт", endText: "", notSupportedText: "Отсканируйте этот QR-код с помощью мобильного устройства, чтобы увидеть эту модель в дополненной реальности." }) {

		const button = document.createElement('button');

		function showStartAR( /*device*/) {

			if (sessionInit.domOverlay === undefined) {

				const overlay = document.createElement('div');
				overlay.style.display = 'none';
				document.body.appendChild(overlay);

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('width', 38);
				svg.setAttribute('height', 38);
				svg.style.position = 'absolute';
				svg.style.right = '20px';
				svg.style.top = '20px';
				svg.addEventListener('click', function () {

					currentSession.end();

				});
				overlay.appendChild(svg);

				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28');
				path.setAttribute('stroke', '#fff');
				path.setAttribute('stroke-width', 2);
				svg.appendChild(path);

				if (sessionInit.optionalFeatures === undefined) {

					sessionInit.optionalFeatures = [];

				}

				sessionInit.optionalFeatures.push('dom-overlay');
				sessionInit.domOverlay = { root: overlay };

			}

			//

			let currentSession = null;

			async function onSessionStarted(session) {

				session.addEventListener('end', onSessionEnded);

				renderer.xr.setReferenceSpaceType('local');

				await renderer.xr.setSession(session);

				button.textContent = 'STOP AR';
				sessionInit.domOverlay.root.style.display = '';
				button.style.display = "none";

				currentSession = session;

			}

			function onSessionEnded( /*event*/) {

				currentSession.removeEventListener('end', onSessionEnded);

				button.textContent = texts.startText;
				sessionInit.domOverlay.root.style.display = 'none';

				currentSession = null;

			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% )';
			button.style.width = '180px';

			button.textContent =  texts.startText;

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

			button.onclick = function () {

				if (currentSession === null) {

					navigator.xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);

				} else {

					currentSession.end();

					if (navigator.xr.offerSession !== undefined) {

						navigator.xr.offerSession('immersive-ar', sessionInit)
							.then(onSessionStarted)
							.catch((err) => {

								console.warn(err);

							});

					}

				}

			};

			if (navigator.xr.offerSession !== undefined) {

				navigator.xr.offerSession('immersive-ar', sessionInit)
					.then(onSessionStarted)
					.catch((err) => {

						console.warn(err);

					});

			}

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50%)';
			button.style.width = '310px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showARNotSupported() {

			disableButton();

			button.textContent = texts.notSupportedText;

		}

		function showARNotAllowed(exception) {

			disableButton();

			console.warn('Exception when trying to call xr.isSessionSupported', exception);

			button.textContent = texts.notSupportedText;

		}

		function stylizeElement(element) {

			element.classList.add("ar-button");

		}

		if ('xr' in navigator) {

			button.id = 'ARButton';
			button.style.display = 'none';

			stylizeElement(button);

			navigator.xr.isSessionSupported('immersive-ar').then(function (supported) {

				supported ? showStartAR() : showARNotSupported();

			}).catch(showARNotAllowed);

			return button;

		} else {

			const message = document.createElement('a');

			if (window.isSecureContext === false) {

				message.href = document.location.href.replace(/^http:/, 'https:');
				message.innerHTML = 'Для работы XR требуется безопасное соединение с сайтом (https)'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.width = '280px';
			message.style.textDecoration = 'none';
			message.style.textWrap = 'balance';
			message.style.height = 'auto';

			stylizeElement(message);

			return message;

		}

	}

}

export { ARButton };