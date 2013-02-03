(function( $, Backbone, _ ){

	var catapi = [
		'<a href="http://thecatapi.com">',
		'<img src="http://thecatapi.com/api/images/get?format=src&type=jpg&size=small&',
		'<%= Date.now() %>',
		'"></a>'
		].join(''),


	BaseView = Backbone.View.extend({
		activated: false,
		events: {
			'click [data-kitty]':'addKitty'
		},
		kittyTemplate: _.template( catapi ),
		constructor: function() {
			this.on('activated', this._onActivated, this );
			this.on('deactivated', this._onDeactivated, this );
			Backbone.View.prototype.constructor.apply( this, arguments );
		},
		_onActivated: function() {
			console.log("activated:", this.id );
			this.activated = true;
		},
		_onDeactivated: function() {
			console.log("deactivated:", this.id );
			this.activated = false;
		},
		addKitty: function() {
			this.$el.append( this.kittyTemplate() );
		}
	}),

	DataView = BaseView.extend({
		id: 'data',
		render: function() {
			this.$el
				.append('<h1>Data!</h1>')
				.append( $('#dataform').html() );
			return this;
		}
	}),

	KittiesView = BaseView.extend({
		id: 'Kitties',
		render: function() {
			this.$el
				.append('<h1>Kitties!</h1>')
				.append('<button data-kitty>Meow</button>');

			return this;
		}
	}),

	MainView = Backbone.View.extend({
		el: '#app',
		views: {},
		initialize: function() {
			this.views.data = new DataView().render();
			this.views.kitties = new KittiesView().render();
			App.on('switch', this.switchTo, this );
		},
		switchTo: function( viewId ) {
			if (!this.views[viewId] || viewId === this.activeView ) return;

			var active = this.views[this.activeView];

			// Detach first
			if ( active ) {
				active.trigger('deactivating');
				active.$el.detach();
				active.trigger('deactivated');
			}

			// Attach new view
			active = this.views[viewId];
			active.trigger('activating');
			this.$('#views').append( active.$el );
			active.trigger('activated');

			// Update our nav
			var activeClassName = 'active';
			this.$('.nav')
				.find('.'+ activeClassName )
					.removeClass( activeClassName )
					.end()
				.find('[data-view='+ viewId +']')
					.addClass( activeClassName );

			// Cache our viewId for next time.
			this.activeView = viewId;
		}
	}),

	Router = Backbone.Router.extend({
			routes: {
				'(:view)':'switch'
			},
			switch: function( view ) {
				App.trigger('switch', view || 'data' );
			}
	}),

	App = _.extend( Backbone.Events, {
		start: function() {
			var router = new Router(),
				main = new MainView();
			Backbone.history.start();
		}
	});


	$(function(){ 
		App.start(); 
	});

})( jQuery, Backbone, _ )