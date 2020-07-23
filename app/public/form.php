<?php
include_once 'sqlManager.php';
ini_set('error_log', './log/form.log');

function get_id() {
    if (isset($_GET) && isset($_GET['id']) && !is_nan($_GET['id'])) {
        return $_GET['id'];
    } else {
        return -1;
    }
}

if (!can_give_feedback(get_id())) {
    header('Location: https://cse.unl.edu/~learningassistants/LA-Feedback/thankyou.html');
}

?>

<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>LA Feedback Required</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script type="text/javascript">
        /* global $ */
        function validateSubmit() {
            let rating = $("#rating").val();
            let comment = $("#comment").val().trim();

            if (rating <= 0) {
                alert('Invalid Rating');
                return false;
            }

            if (rating < 5 && (comment === null || comment === undefined || comment.length === 0)) {
                alert('Please include a comment on below average ratings');
                return false;
            }

            const id = "<?php echo get_id(); ?>";
            if (id && id >= 0) {
                $.ajax({
                    url: `https://cse.unl.edu/~learningassistants/LA-Feedback/submitFeedback.php`,
                    method: "POST",
                    data: {
                        id,
                        rating,
                        comment,
                    }
                });
                window.location.href = `https://cse.unl.edu/~learningassistants/LA-Feedback/thankyou.html`
            } else {
                alert('Missing Interaction ID');
                return false;
            }
        }
    </script>
    <style>
        :root {
            --PrimaryBackground: #cd0d0c;
            --SpecialTextColor: #dee3e8;
        }

        @media (prefers-color-scheme: light) {
            :root {
                --TextColor: #000000;
                --TextBackground: #ffffff;
            }
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --TextColor: #ffffff;
                --TextBackground: #212529;
            }
        }

        img {
            border: none;
            -ms-interpolation-mode: bicubic;
            max-width: 100%;
        }

        body {
            background-color: var(--PrimaryBackground);
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        table {
            border-collapse: separate;
            mso-table-lspace: 0;
            mso-table-rspace: 0;
            width: 100%;
        }

        table td {
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
        }

        /* -------------------------------------
            BODY & CONTAINER
        ------------------------------------- */

        .primaryBG {
            background-color: var(--PrimaryBackground);
            width: 100%;
        }

        /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
        .container {
            display: block;
            padding: 10px;
        }

        /* This should also be a block element, so that it will fill 100% of the .container */
        .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 580px;
            padding: 10px;
        }

        /* -------------------------------------
            HEADER, FOOTER, MAIN
        ------------------------------------- */
        .main {
            background: var(--TextBackground);
            border-radius: 3px;
            width: 100%;
            color: var(--TextColor);
        }

        .wrapper {
            box-sizing: border-box;
            padding: 20px;
        }

        .content-block {
            padding-bottom: 10px;
            padding-top: 10px;
        }

        .footer {
            clear: both;
            margin-top: 10px;
            text-align: center;
            width: 100%;
        }

        .footer td,
        .footer p,
        .footer span,
        .footer a {
            color: var(--SpecialTextColor);
            font-size: 12px;
            text-align: center;
        }

        .preheader {
            color: transparent;
            display: none;
            height: 0;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            visibility: hidden;
            width: 0;
        }

        hr {
            border: 0;
            border-bottom: 1px solid var(--PrimaryBackground);
            margin: 20px 0;
        }

        .custom-select {
            display: inline-block;
            width: 100%;
            height: calc(1.5em + .75rem + 2px);
            padding: .375rem 1.75rem .375rem .75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: #495057;
            vertical-align: middle;
            background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right .75rem center/8px 10px;
            border: 1px solid #ced4da;
            border-radius: .25rem;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }

        /* -------------------------------------
            RESPONSIVE AND MOBILE FRIENDLY STYLES
        ------------------------------------- */
        @media only screen and (max-width: 620px) {
            table[class=body] h1 {
                font-size: 28px !important;
                margin-bottom: 10px !important;
            }

            table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
                font-size: 16px !important;
            }

            table[class=body] .wrapper {
                padding: 10px !important;
            }

            table[class=body] .content {
                padding: 0 !important;
            }

            table[class=body] .container {
                padding: 0 !important;
                width: 100% !important;
            }

            table[class=body] .main {
                border-left-width: 0 !important;
                border-radius: 0 !important;
                border-right-width: 0 !important;
            }

            table[class=body] .btn table {
                width: 100% !important;
            }

            table[class=body] .btn a {
                width: 100% !important;
            }
        }

        /* -------------------------------------
            PRESERVE THESE STYLES IN THE HEAD
        ------------------------------------- */
        @media all {

            .apple-link a {
                color: inherit !important;
                font-family: inherit !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
                text-decoration: none !important;
            }

            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
                font-size: inherit;
                font-family: inherit;
                font-weight: inherit;
                line-height: inherit;
            }
        }

    </style>
</head>
<body>
<span class="preheader">Help us to improve the Learning Assistant Program</span>
<table role="presentation" class="primaryBG">
    <tr>
        <td class="container">
            <div class="content">

                <!-- START CENTERED WHITE CONTAINER -->
                <div class="content" role="presentation">

                    <!-- START CENTERED WHITE CONTAINER -->
                    <table role="presentation" class="main">

                        <!-- START MAIN CONTENT AREA -->
                        <tbody>
                        <tr>
                            <td class="wrapper">
                                <table role="presentation">
                                    <tbody>
                                    <tr>
                                        <td>
                                            <p>Hi,</p>
                                            <p>You recently had an interaction with the learning
                                                assistant <?php echo get_name_from_interaction(get_id()) ?>. Please help
                                                us to know how they did. Your response will be anonymous and will help
                                                us to improve the LA program for everyone.</p>
                                            <div style="padding-right: 10px;">
                                                <div class="form-group row">
                                                    <label for="rating" class="col-sm-4 col-form-label">Rating</label>
                                                    <select id="rating" class="custom-select col-sm-8" required>
                                                        <option value="0">(choose)</option>
                                                        <option value="1">1 (low)</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="4">4</option>
                                                        <option value="5">5</option>
                                                        <option value="6">6</option>
                                                        <option value="7">7</option>
                                                        <option value="8">8</option>
                                                        <option value="9">9</option>
                                                        <option value="10">10 (high)</option>
                                                    </select>
                                                </div>

                                                <div class="form-group row">
                                                    <label for="comment" class="col-sm-4 col-form-label">Comment
                                                        (Optional)</label>
                                                    <textarea id="comment" class="col-sm-8" rows="5"
                                                              style="resize: none;padding: 5px"
                                                              maxlength="500"></textarea>
                                                    <span id="char_count"
                                                          style="float: right !important;background-color: #777777;margin-top: -30px;margin-right: 5px;margin-inline-start: auto;display: inline;padding: .2em .6em .3em;font-size: 75%;font-weight: 700;color:#ffffff;text-align: center;white-space: nowrap;border-radius: .25em;z-index: 1;height: fit-content;"></span>
                                                </div>
                                                <div class="form-group row">
                                                    <button onclick="validateSubmit()" class="btn btn-danger col-sm-11"
                                                            style="background-color: var(--PrimaryBackground);margin: 20px auto 0">
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>


                        </tbody>
                    </table>
                    <!-- END MAIN CONTENT AREA -->
                </div>
                <!-- END CENTERED WHITE CONTAINER -->

                <!-- START FOOTER -->
                <div class="footer">
                    <table role="presentation">
                        <tr>
                            <td class="content-block">
                                <a class="apple-link" href="http://cse.unl.edu" target="_blank">Learning Assistant
                                    Program, University of Nebraska-Lincoln - CSE Department</a>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </td>
    </tr>
</table>
<script>
    let text_max = 500;
    $('#char_count').html('0 / ' + text_max);

    $('#comment').keyup(() => {
        $('#char_count').html($('#comment').val().length + ' / ' + text_max);
    });
</script>
</body>
</html>
