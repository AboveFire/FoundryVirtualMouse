Hooks.on('canvasReady', function(){
    // check for common mobile user agents
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    )
    {
      // the user is using a mobile device, so redirect to the mobile version of the website
      function opencontrols() {
        Controls = new Controls();
        Controls.openDialog();
        }
        opencontrols();
    }
});

export class Controls extends Application {
		openDialog() {
			let $dialog = $('.Controls-window');
			if ($dialog.length > 0) {
				$dialog.remove();
				return;
			}
			const templateData = { data: [] };
			templateData.title = "Controls";
			templateData.user = game.userId;
			templateData.charname = game.user.charname;
			const templatePath = "/modules/virtual-mouse/mouse.html";;
			console.log(templateData);
			this.appId = "virtual-mouse-controls";
			Controls.renderMenu(templatePath, templateData);
		}
		static renderMenu(path, data) {
			const dialogOptions = {
                height: 300,
				width: 350,
				top: event.clientY - 80,
				left: window.innerWidth - 510,
				classes: ['Controls-window'],
				id: 'virtual-mouse-controls'
			};
			renderTemplate(path, data).then(dlg => {
				new Dialog({
					content: dlg,
					buttons: {}
				}, dialogOptions).render(true);
			});
		}

}