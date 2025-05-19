# API RTFM – Backend Laravel

Bienvenue dans le backend de la plateforme **RTFM - Quiz & Apprentissage Interactif**.  
Ce projet gère toute la logique métier, l’authentification, la gestion des quiz, des utilisateurs, des tournois et la communication en temps réel via WebSockets.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 Fonctionnalités principales

- **API RESTful** pour toutes les fonctionnalités de la plateforme
- **Authentification sécurisée** (Sanctum)
- **Gestion des quiz, utilisateurs, tournois, badges, statistiques**
- **WebSockets** pour le temps réel (quiz live, notifications, etc.)
- **Export PDF** (DomPDF)
- **Documentation automatique** (Scribe)

---

## 🛠️ Technologies

- **Laravel 12**
- **PHP 8.3+**
- **MySQL/MariaDB**
- **Sanctum**
- **WebSockets**
- **DomPDF**
- **Scribe**

---

## ⚙️ Installation

### Prérequis

- PHP 8.3+
- Composer 2+
- MySQL/MariaDB 10.5+

### Étapes

```bash
# Cloner le dépôt (depuis la racine du projet)
git clone https://github.com/Laurent-studi/rtfmlara.git
cd rtfmlara/api

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env

# Lancer les migrations et seeders
php artisan migrate --seed

# Démarrer le serveur de développement
php artisan serve
```

---

## 📁 Structure

```
api/
├── app/
│   ├── Http/Controllers/Api/   # Contrôleurs API
│   ├── Models/                 # Modèles Eloquent
│   ├── Services/               # Logique métier
│   └── ...
├── routes/                     # Routes API
├── database/                   # Migrations, seeders, factories
└── ...
```

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🧑‍💻 Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m "Ajout de ma fonctionnalité"`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

Développé avec ❤️ par Laurent
