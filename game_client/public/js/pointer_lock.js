function pointerLock(controls, client, clock) {
    var havePointerLock =
        'pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document;

    var element = document.body;
    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    var hostname = document.getElementById('host-name');
    var username = document.getElementById('user-name');

    function preventBubbling(event) {
        event.stopPropagation();
    }

    hostname.addEventListener('click', preventBubbling, false);
    username.addEventListener('click', preventBubbling, false);

    if (havePointerLock) {
        var pointerlockchange = function(event) {
            if (document.pointerLockElement === element ||
                document.mozPointerLockElement === element ||
                document.webkitPointerLockElement === element)
            {
                clock.resume();
                controls.enabled = true;

                blocker.style.display = 'none';
            } else {
                clock.pause();
                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';
            }
        };

        var pointerlockerror = function(event) {
            instructions.style.display = '';
        };

        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);


        function lock(event) {
            if (!client.authenticate(hostname.value, username.value)) {
                return;
            }

            instructions.style.display = 'none';

            element.requestPointerLock =
                element.requestPointerLock ||
                element.mozRequestPointerLock ||
                element.webkitRequestPointerLock;

            element.requestPointerLock();
        }

        function lockOnEnter(event) {
            var key = event.keyCode || event.charCode;
            // enter
            if (key === 13) {
                lock(event);
            }
        }

        instructions.addEventListener('click', lock, false);
        hostname.addEventListener('keypress', lockOnEnter, false);
        username.addEventListener('keypress', lockOnEnter, false);
    } else {
        instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API";
    }
}