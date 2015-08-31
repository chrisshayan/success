MainLayout = React.createClass({
    componentDidMount() {

        // Minimalize menu when screen is less than 768px
        $(window).bind("resize load", function () {
            if ($(this).width() < 769) {
                $('body').addClass('body-small')
            } else {
                $('body').removeClass('body-small')
            }
        });

        // Fix height of layout when resize, scroll and load
        $(window).bind("load resize scroll", function() {
            if(!$("body").hasClass('body-small')) {

                var navbarHeigh = $('nav.navbar-default').height();
                var wrapperHeigh = $('#page-wrapper').height();

                if(navbarHeigh > wrapperHeigh){
                    $('#page-wrapper').css("min-height", navbarHeigh + "px");
                }

                if(navbarHeigh < wrapperHeigh){
                    $('#page-wrapper').css("min-height", $(window).height()  + "px");
                }

                if ($('body').hasClass('fixed-nav')) {
                    $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
                }
            }
        });
    },

    render() {
        return (
            <div id="wrapper">
                <Navigation />

                <div id="page-wrapper" className="gray-bg">
                    <TopNav />

                    {this.props.content}

                    <Footer />
                </div>
            </div>
        );
    }
});