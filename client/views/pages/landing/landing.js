Template.landing.rendered = function(){

    $('body').addClass('landing-page');
    $('body').attr('id', 'page-top');

    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 80
    });

    // Page scrolling feature
    $('a.page-scroll').bind('click', function(event) {
        var link = $(this);
        $('html, body').stop().animate({
            scrollTop: $(link.attr('href')).offset().top - 50
        }, 500);
        event.preventDefault();
    });

    // user avatars
    $('#avatar1').attr("src", "data:image/png;base64,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");
    $('#avatar2').attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAA5CAMAAAC7xnO3AAAAgVBMVEX////+/v79/f25ubm+vr64uLj8/Py1tbW0tLSwsLCurq69vb3m5ua7u7vFxcXi4uLe3t7BwcFvb2/q6urw8PDJycnExMSfn5/19fXt7e3W1tbNzc3AwMB7e3v5+fnR0dGqqqqkpKR1dXVqamry8vLa2tqNjY1fX1+EhIRlZWWYmJj+2X8zAAAEmklEQVRIx6WWibaiMAyGkwIFyr7JLpuA+v4POAmXEe+o586c+Y9LhXz5k7b0CCxEBNbjBwoUEt0MeSAE4nb9NRbwuyiUkSJanAI38k+9J5kiQTCkni+2PK/kJ1E4uP1dhSCykkj4W3FLybCYPgpfOZcX8lOfPDmQ5ss9AOFbuuGlXDCV/6HPA2OFJzXMIE+W7jgmo6QfZ4izX/rcdhl0dN3x2BVfyBdxTKpZqoNzZHm6TqxuaOz609zwqhvL4EJxspjbRAV/IB89cmpXOaokR1PfSOrUoWkqUbDgbZ9CMBsGS+4ig7ucr4JLlJIC3pGCX9Attpewo/MgGfUYxVdyx4FW/jT0waNUZrYBuxolHnv/BS1yPUygaEyimDjAHf1OHNUmBfgJXHST6yPDvVYeOYwme+BBCq5Doqv0AjB1LM/zNHppGg++xFdMIxEk+YSKbVpdWylyjMyI1OhNo0dNQyOS3kQ00iwt2Uy+k0CgnVBCud3j1KTi6/O8RSSmaboCn0n+5dq9lYDE+ZSx/K7IslMlIKMvAaVvWplMTIsLhuc+2dFKKEEZT3EcT9NqW2u8KlC3ac3RjtdbfMshMSzDfe5TfoGAgPl0bdtxHO/zOLaxrOI2boW6jZ0ZrwuAa5iG++SKDJbIPQUXM57y0sX71MZDEI/tVIW3sc1q3w+o90SjXg/PUNlOuh9ceI3jBKGaWiKvZHnFaCX7qRcgqdC0Mc3wQVa93ZyJ5B2ppsmmHNfpvnDR7TSDMNuxHW8VUFG0Mw2rOqqdbVsrQEgJyRi3lMS7XR0yVfk0BPmQYDPG1wKlxMIhSwFPqFJawWQeTz5AOt6iiAqs4zgd1lte5VM88zykHoF4gBLFbCvjAuCv64Igl/WatuvijmsPd1qP9XadgfKmnsXg9z0UbqjODxkUfR7KoS+Su7pAaef5kAkKws0Rnrf8tt8I1cqtgm29+K74eiPS1xlhA1FIPMhtQXhtNN8/RaeTf2LRmEc88L2ogFSzaXJIG3mIqg+VZVpv1dsulLQHAvKAFwkUoTK1d1JmCqVhm8GHM0EIGeyo8RD/so10dyTB69nHLAbKegYZJS8GLdMFKfbQV09k9E+QFiugRyQAfCUP/AvdRRyXWvBBQ45PwAu5rc8TyqCWYqqVwbFXP5FUMhlsjjsIab8MCAI/QIzB1i0fSdaGMniBUMu1kp9M1h77hhRMMrpZ8qNXaL5WopDyLXloz5BsrorAWbP7cL/+s1AQantKOwP1nJ8BGPs7UtA69F4hkiq33fflff4PFuhnEPlgFSD/8d8bfdSzmacoz/KV/FwCd3bJ7z358hHwb6J1VQEg/LOQ2jvj34NHG9ws8PA3/dNOOAKF2LfF93v89VwZboFi1z6Q+5DvHTc57kCpIxYnFWegKh+p+arcjYXcIp5rTUIZdVVdRYHrljKQVebWYVgHnR92dL2o6q4KslNyqet67qosfJDWFU73rhqy+qou4AfZfO1UrrpGH+qAjjyjV/bgZn2WN9VS+0vzIH3PTbrOqcI6yrVL5Pl+46nIzMK58zvfCurLnEVZWJ8qu9Y0v+7gv/QLqU9RiTyFtVsAAAAASUVORK5CYII=");
    $('#avatar3').attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAA5CAMAAAC7xnO3AAAAolBMVEX///8zMzP5+fnR0dH19fXk5OStra2rq6v+/v7BwcG1tbWysrKpqany8vL8/PzMzMzu7u7p6end3d3Gxsa4uLjZ2dnU1NQ5OTlDQ0PKysqlpaWgoKA9PT3h4eGvr6+Xl5fm5ubX19f09PS9vb25ubmGhobr6+vOzs5jY2P39/eQkJCUlJSNjY1NTU1zc3OCgoJ9fX2RkZF5eXlWVlZpaWldXV18DJFnAAADjklEQVRIx+1Ua3ejIBAFiQ8EouIj0UYbo+bRmGe7//+v7QDabXbTnubz9p4TMsJcBmbugH7w32BVEzu0HudFgc+54zd5Vj5CX6XU4axtE79yucOaGOi7rymeGpaBD9HaJPENGNB51cZERpMvuBMTLmGO67yjqiqHF08F/zx8tEkgnF9x149Te8DyHXYp07SMhPdvuIoz3+FVsykF+g68IZzrVi4Eq6Mp+jYmkjoFd1mzsXcP1Y4kwEogmKV2CaNS1iSI4zwgWSpLOwpDMbGmU+9vXlsUzG/JMlzLDU2YWxRPCoX+NxZ3K79t4pzUEvbZDVuINIb6JfGmLkMRLiF9NdnkMW0aSuM835CsrlMpyxKyHK1Dsdp90FSYtbzQt/wwaVnfSpRVxhV3HJfRbPmwytdKBawCnQXl6iGmUZ7rJ0wrKPTuO02tnXVvaZkzXiWgWs5o8AF5kJukKd2v7m8qsgaE1LbQYO/ghaqN69MgtUMV8Q7VG7PFEg1QPzQNMy3mfTtbjqtfhfqTtvbumEbJPt2k6y/ieBMhVgAhJp5nCSGUpZOo21AETbweNoNF7Thm6DpfaOAtQs1cfcwWv5hZk29Y4aq5/eh4GB6Vw2J/eQGcCoQcfN6/vOy7OT4hQI5xT0l7xpjC1xZftGP3PKhsfvxzT4YjY3a4gDzN5rb+yrea+YpucXibAoy8Gc7G2bmFnnH9MW1vh9FxnMBzAE5umRdso+1cHSRuKc2pROhsHJ9GIqx3XXc6khsmxCsH5hxStMA9QseFdlQHv73nLfN1tkN7nEJxspxEZ9zcu+cNc8jQkzpUhA+mlDY+WJp5q5lfs2eNfW9DVU7afMVXBKAYX2JCT3gmdVUGxy41zG5mgDEBJSy0eeBII91iheNSOy5Gz2Rs1RHwof9vnqggJuIvx7Ewq8mIyF4PVmgPiHZQQlhQEKOfGFpHBiQlgDRTg5Qw1lkGU5mUMNZ6zDKwalITMMtsqYnW7StTDo0h1M8OoUPghR/WkEEamdymV7Q8WTDfKY1Wvk9BpwHdIFRfeA5H2vcwxgG0wwuiIZr6RWK2Cs5O0UMV+VbJau/2LkL+todGol2GPA/FHEJUkE52Zu4akWfkmszTOKhpiew+6QkoINhT8Gkzdwp7FrlqFAZDq2Yj/zpFocOOhUkthI4sby2QZSNPgGBgboqk5VmgOw8uqs4mYAH+pTKphEP84AcGvwFyvlXe3HOEVAAAAABJRU5ErkJggg==");


    var cbpAnimatedHeader = (function() {
        var docElem = document.documentElement,
            header = document.querySelector( '.navbar-default' ),
            didScroll = false,
            changeHeaderOn = 200;
        function init() {
            window.addEventListener( 'scroll', function( event ) {
                if( !didScroll ) {
                    didScroll = true;
                    setTimeout( scrollPage, 250 );
                }
            }, false );
        }
        function scrollPage() {
            var sy = scrollY();
            if ( sy >= changeHeaderOn ) {
                $(header).addClass('navbar-scroll')
            }
            else {
                $(header).removeClass('navbar-scroll')
            }
            didScroll = false;
        }
        function scrollY() {
            return window.pageYOffset || docElem.scrollTop;
        }
        init();

    })();

};

Template.landing.destroyed = function() {
    $('body').removeClass('landing-page');
};
