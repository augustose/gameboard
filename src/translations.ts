export type Language = 'en' | 'es';

export const translations = {
    en: {
        // Menu
        menu_new_game: "New Game / Active",
        menu_history: "History",
        menu_stats: "Stats",
        menu_about: "About",
        menu_data: "Data",
        menu_export: "Export Data",
        menu_import: "Import JSON",

        // Game Setup
        setup_title: "New Game",
        setup_subtitle: "Setup your match",
        setup_variant: "Game Variant",
        setup_players: "Players",
        setup_add_player: "Add Player",
        setup_start: "Start Game",
        setup_player_placeholder: "Player",

        // App Header / Actions
        app_active_match: "Active Match",
        app_new_game: "New Game",
        app_cancel: "Cancel",
        app_finish: "Finish Game",

        // Alerts / Confirmations
        confirm_cancel: "Are you sure you want to cancel this game? All progress will be lost.",
        confirm_new_game: "Start new game? Current progress will be lost if not finished.",
        confirm_finish: "Finish game and show results?",
        confirm_delete: "Delete this game from history?",
        alert_import_success: "Data imported successfully!",
        alert_import_error: "Invalid file format.",

        // Scoreboard
        rounds_title: "Rounds",
        game_rummy: "Rummy",
        game_continental: "Continental",

        // History
        history_title: "Game History",
        history_empty: "No played games yet.",
        history_export_btn: "Export",
        history_import_btn: "Import",

        // Stats
        stats_title: "Statistics",
        stats_total_games: "Total Games",
        stats_top_player: "Top Player",
        stats_rummy_games: "Rummy Games",
        stats_continental_games: "Continental Games",
        stats_win_distribution: "Win Distribution",
        stats_play_more: "Play some games to see formatted charts!",

        // Stats Table
        th_player: "Player",
        th_games: "Games",
        th_wins: "Total Wins",
        th_rum_wins: "Rum Wins",
        th_con_wins: "Con Wins",
        th_win_rate: "Win Rate",

        // About
        about_title: "About the App",
        about_intro: "This application was created by Augusto Sosa with passion and dedication. Designed to turn chaotic game nights into organized fun, \"El Turix Scoreboard\" offers a modern way to keep score for Classic Rummy and Continental games.",
        about_features: "Features",
        about_feature_1: "Support for Standard Rummy and Continental variants.",
        about_feature_2: "Automatic score calculation and leader highlighting.",
        about_feature_3: "Persistent history of your past games.",
        about_feature_4: "Detailed statistics to settle who is truly the best.",
        about_feature_5: "Works offline and on mobile.",
        about_meaning_title: "Meaning of \"Turix\"",
        about_meaning_text: "\"Turix\" is the Mayan word for Dragonfly. In many cultures, dragonflies symbolize change, transformation, and adaptability—skills every good card player needs!",
        about_credits: "Credits",
        about_dev: "Developer",
        about_design: "Design",
        about_opensource: "Open Source",
        about_opensource_text: "This project is open source. You can view the code, report issues, or contribute on GitHub:",
        about_footer: "Made with ❤️ for Game Night",
        about_tribute_title: "Tribute",
        about_tribute_text: "El Turix pays tribute to the establishment created by my dear father-in-law, Don Rafael (R.I.P.). A great man, husband, father, and friend, who knew how to live and was a beautiful contribution to society, improving the lives of those who knew him.",
        about_thanks_title: "Special Thanks",
        about_thanks_list: "Maruca P, Alejandra P, Maria Jose C., Tia Carmen, Tio Manuel P., Kiki P., Las Tias Psyco, Las Jugetonas, Alba, Augusto J, Maria C, Chiquilina. (If I forgot anyone, let me know! :-))",
        landing_purpose: "Keep score of your Rummy and Continental games easily and elegantly."
    },
    es: {
        // Menu
        menu_new_game: "Nuevo Juego / Activo",
        menu_history: "Historial",
        menu_stats: "Estadísticas",
        menu_about: "Acerca de",
        menu_data: "Datos",
        menu_export: "Exportar Datos",
        menu_import: "Importar JSON",

        // Game Setup
        setup_title: "Nuevo Juego",
        setup_subtitle: "Configura tu partida",
        setup_variant: "Variante de Juego",
        setup_players: "Jugadores",
        setup_add_player: "Agregar Jugador",
        setup_start: "Comenzar Juego",
        setup_player_placeholder: "Jugador",

        // App Header / Actions
        app_active_match: "Partida Activa",
        app_new_game: "Nuevo Juego",
        app_cancel: "Cancelar",
        app_finish: "Terminar Juego",

        // Alerts / Confirmations
        confirm_cancel: "¿Estás seguro de cancelar este juego? Se perderá todo el progreso.",
        confirm_new_game: "¿Comenzar nuevo juego? El progreso actual se perderá si no finalizas.",
        confirm_finish: "¿Terminar juego y ver resultados?",
        confirm_delete: "¿Eliminar este juego del historial?",
        alert_import_success: "¡Datos importados correctamente!",
        alert_import_error: "Formato de archivo inválido.",

        // Scoreboard
        rounds_title: "Rondas",
        game_rummy: "Rummy",
        game_continental: "Continental",

        // History
        history_title: "Historial de Juegos",
        history_empty: "No hay juegos jugados aún.",
        history_export_btn: "Exportar",
        history_import_btn: "Importar",

        // Stats
        stats_title: "Estadísticas",
        stats_total_games: "Total Juegos",
        stats_top_player: "Mejor Jugador",
        stats_rummy_games: "Juegos Rummy",
        stats_continental_games: "Juegos Continental",
        stats_win_distribution: "Distribución de Victorias",
        stats_play_more: "¡Juega más partidas para ver gráficos detallados!",

        // Stats Table
        th_player: "Jugador",
        th_games: "Juegos",
        th_wins: "Victorias",
        th_rum_wins: "Vic. Rum",
        th_con_wins: "Vic. Con",
        th_win_rate: "% Victoria",

        // About
        about_title: "Acerca de la App",
        about_intro: "Esta aplicación fue creada por Augusto Sosa con pasión y dedicación. Diseñada para ordenar las noches de juego, \"El Turix Scoreboard\" facilita llevar el puntaje de Rummy y Continental.",
        about_features: "Características",
        about_feature_1: "Soporte para variantes Rummy Estándar y Continental.",
        about_feature_2: "Cálculo automático de puntajes y resaltado del líder.",
        about_feature_3: "Historial persistente de tus juegos pasados.",
        about_feature_4: "Estadísticas detalladas para decidir quién es realmente el mejor.",
        about_feature_5: "Funciona sin conexión y en móviles.",
        about_meaning_title: "Significado de \"Turix\"",
        about_meaning_text: "\"Turix\" es la palabra maya para Libélula. En muchas culturas, las libélulas simbolizan cambio, transformación y adaptabilidad: ¡habilidades que todo buen jugador de cartas necesita!",
        about_credits: "Créditos",
        about_dev: "Desarrollador",
        about_design: "Diseño",
        about_opensource: "Código Abierto",
        about_opensource_text: "Este proyecto es de código abierto. Puedes ver el código, reportar problemas o contribuir en GitHub:",
        about_footer: "Hecho con ❤️ para Noches de Juego",
        about_tribute_title: "Homenaje",
        about_tribute_text: "El Turix es el establecimiento creado por mi querido suegro Q.E.P.D. Don Rafael. Un gran hombre, gran esposo, gran padre y gran amigo, que supo vivir y fue una bella contribución a la sociedad, mejorando la vida de quienes lo conocimos.",
        about_thanks_title: "Agradecimientos Especiales",
        about_thanks_list: "Maruca P, Alejandra P, Maria Jose C., Tia Carmen, Tio Manuel P., Kiki P., Las Tias Psyco, Las Jugetonas, Alba, Augusto J, Maria C, Chiquilina. (Si me olvido de alguien que me avise! :-))",
        landing_purpose: "Lleva el puntaje de tus partidas de Rummy y Continental de forma fácil y elegante."
    }
};
