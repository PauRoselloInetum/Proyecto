namespace HireAProBackend.Templates
{
    public class EmailContent
    {
        public string WelcomeSubject { get; set; } = "¡Te damos la bienvenida a [nombre empresa]!";
        public string WelcomeBody { get; set; }
        public string ChangePassSubject { get; set; } = "Solicitud de regeneración de contraseña";
        public string ChangePassBody { get; set; }

        public string WelBody(string user)
        {
            WelcomeBody = @"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Regenerar contraseña</title>
    <style>
        body {
            font-family: Verdana, sans-serif, serif, EmojiFont;
        }
        @media screen and (max-width: 400px) {
            .button {
                display: block;
                padding: 8px;
                margin-top: 14px;
                border-radius: 6px;
                background-color: #b54845;
                text-decoration: none !important;
                font-weight: bold;
            }
            .container {
                width: 100% !important;
                height: 100%;
            }
            .imagen {
                max-width: 100%;
            }
        }
        @media screen and (max-width: 700px) {
            .container {
                width: 100% !important;
                height: 100%;
            }
            .imagen {
                max-width: 100%;
            }
        }
        .btn {
            background-color: #b54845;
            color: white;
            padding: 10px 20px;
            font-size: smaller;
            text-decoration: none;
            border-radius: 10px;
        }
    </style>
</head>
<body style='margin:0;padding:0;word-spacing:normal;background-color:#e2e2e2;font-family: Verdana, sans-serif, serif, EmojiFont;'>
    <table class='container' style='margin-left:auto; margin-right:auto; width:100%; border:none; border-spacing:0;'>
        <tr>
            <td align='center'>
                <table style='border:none; border-spacing:0; background-color:white; width:90%; max-width:600px; text-align:center; height:100%; max-height:100%;'>
                    <tr>
                        <td style='background-color:#005573; padding-top:80px;'></td>
                    </tr>
                    <tr>
                        <td style='padding:40px 30px 0px 30px; text-align:center; color:#232d4b;'>
                            <h1>¡Te damos la bienvenida a [nombre empresa]!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td><h2>Nos alegra tenerte con nosotros</h2></td>
                    </tr>
                    <tr>
                        <td style='padding:0px 40px 40px 30px; text-align:center; font-size:large;'>
                            "+user+@" te animamos a explorar un poco
                            <br><br>
                            ¡Encuentra los mejores profesionales!
                            <br><br><br>
                            <b>El equipo de [nombre empresa]</b>
                        </td>
                    </tr>
                    <tr style='background-color:#005573;'>
                        <td style='padding:30px 30px 30px 30px; text-align:center; font-size:smaller; color:white;' align='center'>
                            <p style='color:white'>¿No has sido tú? <a href='' style='color:white; font-size:smaller;'>Contacta con nosotros</a></p>
                        </td>
                    </tr>
                    <tr style='background-color:#232d4b;'>
                        <td colspan='2'>
                            <table width='100%'>
                                <tr>
                                    <td style='padding:20px 30px 30px 30px; color:white; font-size:x-small; text-align:left;'>&copy;2024</td>
                                    <td style='padding:20px 30px 30px 30px; color:white; font-size:x-small; text-align:right;'>[Nombre empresa]</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
            return WelcomeBody;
        }
        public string PassBody(string user, string link)
        {
            ChangePassBody = @"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Regenerar contraseña</title>
    <style>
        body {
            font-family: Verdana, sans-serif, serif, EmojiFont;
            margin: 0;
            padding: 0;
            background-color: #e2e2e2;
            word-spacing: normal;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            text-align: center;
        }
        h1 {
            color: #232d4b;
            font-size: 24px;
            margin: 40px 30px 20px;
        }
       
        .btn {
            background-color: #b54845;
            color: white;
            padding: 12px 20px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 10px;
            display: inline-block;
            margin-top: 20px;
        }
        @media screen and (max-width: 700px) {
            .container {
                width: 100% !important;
            }
            .btn {
                padding: 10px 15px;
                font-size: 14px;
            }
        }
        @media screen and (max-width: 400px) {
            .container {
                width: 100% !important;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 10px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <table class='container'>
        <tr>
            <td align='center'>
                <table style='border:none; border-spacing: 0; background-color: white; width: 90%; max-width:600px; text-align: center;'>
                    <tr>
                        <td style='background-color: #005573; padding-top: 80px;'></td>
                    </tr>
                    <tr>
                        <td style='padding:40px 30px 0px 30px; text-align: center; color:#232d4b;'>
                            <h1>" + user + @"Has solicitado regenerar tu contraseña</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0px 40px 40px 30px; text-align: center; font-size: large;'>
                            Para generar una nueva contraseña, haz click en el siguiente enlace:
                            <br><br>
                            <a href='" + link + @"' class='btn'>Regenerar mi contraseña</a>
                            <br><br><br>
                            <b>El equipo de [nombre empresa]</b>
                        </td>
                    </tr>
                    <tr style='background-color:#005573;'>
                        <td style='padding:30px 30px 30px 30px; text-align: center; font-size: smaller; color: white;'>
                            <p style='color:white;'>¿No has sido tú? <a href='' style='color: white; font-size: smaller;'>Contacta con nosotros</a></p>
                        </td>
                    </tr>
                    <tr style='background-color: #232d4b;'>
                        <td colspan='2'>
                            <table width='100%'>
                                <tr>
                                    <td style='padding:20px 30px 30px 30px; color: white; font-size: x-small; text-align: left;'>&copy;2024</td>
                                    <td style='padding:20px 30px 30px 30px; color: white; font-size: x-small; text-align: right;'>[Nombre empresa]</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
            return ChangePassBody;
        }
    }
}
