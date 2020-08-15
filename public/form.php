<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

// Front end for students responding to requests for feedback

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

<!DOCTYPE html>
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
        const COMMENT_REQUIREMENT_BAR = 5;
        const START_TIME = new Date();

        const onSuccess = () => {
            window.location.href = 'https://cse.unl.edu/~learningassistants/LA-Feedback/thankyou.html';
        };

        const onError = () => {
            alert('Failed to submit');
        };

        function validateSubmit() {
            const rating = $("#rating").val();
            const comment = $("#comment").val().trim();
            const contact = $('#contact')[0].checked;

            if (rating <= 0) {
                alert('Invalid Rating');
                return false;
            } else if (rating < COMMENT_REQUIREMENT_BAR && (comment === null || comment === undefined || comment.length < 4)) {
                alert('Please include a comment that explains the situation');
                return false;
            } else {
                const id = "<?php echo get_id(); ?>";
                const time = new Date() - START_TIME;
                if (id && id >= 0) {
                    $.ajax({
                        url: `https://cse.unl.edu/~learningassistants/LA-Feedback/submitFeedback.php`,
                        method: "POST",
                        data: {
                            id,
                            rating,
                            comment,
                            contact,
                            time,
                        },
                        success: onSuccess,
                        error: onError,
                    });
                    return false;
                } else {
                    alert('Missing Interaction ID');
                    return false;
                }
            }
        }

        function adjustRequirement() {
            const commentRequired = $("#rating").val() < COMMENT_REQUIREMENT_BAR;

            const comment = $('#comment')[0];
            comment.required = commentRequired;
            comment.ariaRequired = commentRequired;
            comment.minLength = commentRequired ? 5 : -1;

            $('#commentRequirement')[0].innerText = commentRequired ? '*' : '';
        }
    </script>
    <style>
        :root {
            --background: #eeeeee;
            --text: #222222;
            --requirement-star: #e00000;
            --form-background: #ffffff;
            --shadows-and-borders: #cccccc;
            --option-bg: #ffffff;
            --button: #e00000;
            --button-text: #ffffff;
            --button-hover: #c00000;
            --button-hover-text: #ffffff;
            --char-count: #e00000;
            --char-count-text: #ffffff;
            --link: #aaaaaa;
            --link-hover: #999999;
            --footer-background: #666666;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background: #000000;
                --text: #eeeeee;
                --requirement-star: #f30000;
                --form-background: #222222;
                --shadows-and-borders: #111111;
                --option-bg: #ffffff;
                --button: #e00000;
                --button-text: #eeeeee;
                --button-hover: #c00000;
                --button-hover-text: #eeeeee;
                --char-count: #e00000;
                --char-count-text: #ffffff;
                --link: #cccccc;
                --link-hover: #999999;
                --footer-background: #111111;
            }
        }

        html, body {
            min-height: 100%;
            background: var(--background);
        }

        body, div, form, input, select {
            padding: 0;
            margin: 0;
            outline: none;
            font-family: Roboto, Arial, sans-serif;
            color: var(--text);
            line-height: 22px;
            font-size: 20px;
        }

        h1, h4, label {
            margin: 15px 0 4px;
            font-weight: 400;
        }

        h4, label {
            margin: 20px 0 4px;
            font-weight: 400;
        }

        .testbox {
            display: flex;
            justify-content: center;
            align-items: center;
            height: inherit;
            padding: 10px;
        }

        .form, form {
            width: 100%;
            padding: 20px;
            box-shadow: 0 2px 5px var(--shadows-and-borders);
            background: var(--form-background);
            margin-bottom: 30px;
        }

        input {
            width: calc(100% - 10px);
            padding: 5px;
            border: 1px solid var(--shadows-and-borders);
            border-radius: 3px;
            vertical-align: middle;
        }

        .title-block select, .title-block input {
            margin-bottom: 10px;
        }

        select {
            padding: 7px 0;
            border-radius: 3px;
            border: 1px solid var(--shadows-and-borders);
            background: transparent;
        }

        select, table {
            width: 100%;
        }

        option {
            background: var(--option-bg);
        }

        .question-answer label {
            display: block;
            padding: 0 20px 10px 0;
        }

        .question-answer input {
            width: auto;
            margin-top: -2px;
        }

        th, td {
            width: 18%;
            padding: 15px 0;
            border-bottom: 1px solid var(--shadows-and-borders);
            text-align: center;
            vertical-align: unset;
            line-height: 18px;
            font-weight: 400;
            word-break: break-all;
        }

        textarea {
            width: calc(100% - 6px);
            resize: none;
        }

        .btn-block {
            margin-top: 20px;
            text-align: center;
        }

        button {
            width: 150px;
            padding: 10px;
            border: none;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
            background-color: var(--button);
            font-size: 16px;
            color: var(--button-text);
            cursor: pointer;
        }

        button:hover {
            background-color: var(--button-hover);
            color: var(--button-hover-text)
        }

        .char-count {
            float: right !important;
            background-color: var(--char-count);
            margin-right: 5px;
            margin-inline-start: auto;
            padding: .2em .6em .3em;
            font-size: 75%;
            color: var(--char-count-text);
            text-align: center;
            white-space: nowrap;
            border-radius: .25em;
            height: fit-content;
        }

        .custom-control-input:checked ~ .custom-control-label::before {
            border-color: var(--button);
            background-color: var(--button);
        }

        .footer-link {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            background: var(--footer-background);
            text-align: center;
            font-size: 14px;
            padding: 7px;
        }

        .footer-link a {
            color: var(--link);
        }

        .footer-link a:hover {
            color: var(--link-hover);
            text-decoration: none;
        }

        label span {
            color: var(--requirement-star)
        }

        @media (min-width: 568px) {
            .title-block select {
                width: 30%;
                margin-bottom: 0;
            }

            .title-block input {
                width: 31%;
                margin-bottom: 0;
            }

            th, td {
                word-break: keep-all;
            }
        }
    </style>
</head>
<body>
<div class="testbox">
    <div class="form">
        <h1>Learning Assistant Feedback</h1>
        <p style="margin-bottom:0">Hi,</p>
        <p>You recently had an interaction with a learning
            assistant for <?php echo get_course_from_interaction(get_id()) ?>. Please help us to know
            how <?php echo get_name_from_interaction(get_id()) ?> did.
            Your feedback will be shared with the LA in a summary of responses with no attached names.</p>
        <label for="rating">Rating<span>*</span></label>
        <select id="rating" class="custom-select" onchange="adjustRequirement();" required aria-required="true">
            <option value="0">(choose)</option>
            <option value="1">1 (non-helpful)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10 (helpful)</option>
        </select>
        <label for="comment">Please explain your experience<span id="commentRequirement"></span></label>
        <div>
            <textarea id="comment" rows="5" maxlength="500"></textarea>
            <span id="char_count" class="char-count"></span>
        </div>
        <div class="custom-control custom-checkbox">
            <input class="custom-control-input" id="contact" type="checkbox">
            <label class="custom-control-label" for="contact">Would you like to be contacted by the program?</label>
        </div>
        <div class="btn-block">
            <button type="submit" onclick="validateSubmit();">Send Feedback</button>
        </div>
        <div class="footer-link">
            <a href="http://cse.unl.edu" target="_blank">Learning Assistant
                Program, University of Nebraska-Lincoln — CSE Department</a>
        </div>
    </div>
</div>
<script>
    let text_max = 500;
    $('#char_count').html('0 / ' + text_max);

    $('#comment').keyup(() => {
        $('#char_count').html($('#comment').val().length + ' / ' + text_max);
    });
</script>
</body>
</html>
