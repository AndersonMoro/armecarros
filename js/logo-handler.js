function loadLogo() {
    const logoName = 'branca.png';
    const logoPath = attached_assets.getPath(logoName);
    const logoElement = document.getElementById('logo');
    logoElement.src = logoPath;
}