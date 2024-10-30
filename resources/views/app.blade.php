<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'AttendEZ') }}</title>
    <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
    crossorigin="anonymous"
    />
    <script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" crossorigin></script>

    <script
    src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"
    crossorigin></script>

    <script
    src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
    crossorigin></script>

    <script>var Alert = ReactBootstrap.Alert;</script>
    @viteReactRefresh
    @vite('resources/js/App.jsx')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
