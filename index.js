import { checkAuthStatus, getUserProjects } from './api.js';

checkAuthStatus((user) => {
    if (user) {
        fetchAndDisplayProjects(user.uid);
    } else {
        window.location.href = '/login.html';
    }
});

async function fetchAndDisplayProjects(userId) {
    const projectList = document.getElementById('projectList');
        projectList.innerHTML = `
        <div class="text-center text-blue-700 py-4">
            <span class="loader"></span> Projekte werden geladen...
        </div>
    `;

    try {
        const result = await getUserProjects(userId);
        projectList.innerHTML = '';

        if (result.error) {
            if (result.error === 'permission-denied') {
                projectList.innerHTML = `
                    <div class="text-center text-red-500 py-6">
                        <i class="material-icons" style="font-size:48px; color:orange;">lock</i>
                        <p>Sie haben keine Berechtigung, um auf diese Projekte zuzugreifen. Bitte kontaktieren Sie den Administrator.</p>
                    </div>
                `;
            } else {
                projectList.innerHTML = `
                    <div class="text-center text-red-500 py-6">
                        <i class="material-icons" style="font-size:48px; color:red;">error_outline</i>
                        <p>Fehler beim Abrufen der Projekte. Bitte versuchen Sie es später erneut.</p>
                    </div>
                `;
            }
            return;
        }
        if (result.length === 0) {
            projectList.innerHTML = `
                <div class="text-center text-gray-500 py-6">
                    <i class="material-icons" style="font-size:48px; color:gray;">inbox</i>
                    <p>Es gibt aktuell keine aktiven Demo Projekte.</p>
                </div>
            `;
            return;
        }

        result.forEach((project) => {
            const listItem = document.createElement('li');
            listItem.classList.add('my-2');
            listItem.innerHTML = `
                <a href="/${project.Folder}/${project.ProjectNameTech}/index.html" class="block text-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-center py-3 rounded-md shadow hover:shadow-lg">
                    ${project.ProjectNameFriendly}
                </a>
            `;
            projectList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Fehler beim Abrufen der Projekte:', error);
        projectList.innerHTML = `
            <div class="text-center text-red-500 py-6">
                <i class="material-icons" style="font-size:48px; color:red;">error_outline</i>
                <p>Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>
            </div>
        `;
    }
}
