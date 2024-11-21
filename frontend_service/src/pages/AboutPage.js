import React from 'react';

const AboutPage = () => {
    return (
        <div className="container mt-5">
            <h2>О проекте</h2>
            <p>
                Этот проект создан для того, чтобы пользователи могли легко находить и бронировать отели по всему миру.
                Мы стремимся сделать процесс бронирования простым, быстрым и удобным.
            </p>
            <ul className="list-group mt-3">
                <li className="list-group-item">Простой интерфейс</li>
                <li className="list-group-item">Быстрый поиск</li>
                <li className="list-group-item">Широкий выбор отелей</li>
            </ul>
        </div>
    );
};

export default AboutPage;
