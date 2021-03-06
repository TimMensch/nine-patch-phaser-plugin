/**
 * Return true if value is a String
 * TODO: Use a better method to prevent error
 */
function isString(value){
	return typeof value === 'string';
}

export default class NinePatchImage extends PIXI.DisplayObjectContainer {
	/**
	 * @param {Phaser.Game} game - REF Phaser.Image params
	 * @param {Number} x  - REF Phaser.Image params
	 * @param {Number} y  - REF Phaser.Image params
	 * @param  {String || NinePatchCache} key - The NinePatchCache used by the NinePatchImage. It can be a string which is a reference to the Cache entry, or an instance of a NinePatchCache.
	 */
	constructor(game, x, y, key, frame) {
		super();
		this.anchor = new PIXI.Point();

		Phaser.Component.Core.init.call(this, game, x, y);

		/** Get the NinePatchCache instance */
		var ninePatchImages;

		if (typeof key == 'string') {
			ninePatchImages = game.cache.getNinePatch(key);
		} else if (true /** Check if key is an instance of NinePatchCache */) {
			ninePatchImages = key;
		} else throw new Error('NinePatchImage key must be a String or an instance of NinePatchCache');

		this.ninePatchImages = ninePatchImages;
		/** @type {Array} Generate 9 instances of Phaser.Image as the children of this */
		this.images = ninePatchImages.CreateImages(this);
		/** Setting measures for this */
		this.originalWidth  = ninePatchImages.width;
		this.originalHeight = ninePatchImages.height;
	}

	preUpdate() {
		//Don't do anything
	}

	postUpdate() {
		//Don't do anything
	}

	updateTransform() {
		if (!this.visible)
		{
			return;
		}

		//Backout global scale because we are going to implement our own scaling behavior
		var origScaleX = this.scale.x;
		var origScaleY = this.scale.y;
		this.scale.set(1 / this.parent.worldScale.x, 1 / this.parent.worldScale.y);
		this.displayObjectUpdateTransform();
		this.scale.set(origScaleX, origScaleY);

		if (this._cacheAsBitmap)
		{
			return;
		}

		this.UpdateImageSizes();

		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].updateTransform();
		}
	}

	/** Update images' positions to match the new measures */
	UpdateImageSizes() {
		var {ninePatchImages, originalWidth, originalHeight, images, anchor} = this;
		/** Get the positions for the new measures */
		var newWidth = originalWidth * this.parent.worldScale.x * this.scale.x;
		var newHeight = originalHeight * this.parent.worldScale.y * this.scale.y;

		if (newWidth == this.currentWidth && newHeight == this.currentHeight) {
			//No need to recalc
			return;
		}

		this.currentWidth = newWidth;
		this.currentHeight = newHeight;

		var dimensions = ninePatchImages.CreateDimensionMap(newWidth, newHeight);
		/** Calculate the padding to match the anchor */
		var paddingX = anchor.x * newWidth;
		var paddingY = anchor.y * newHeight;
		/** Loop through all images and update the positions */
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				let image = images[i][j];
				let dimension = dimensions[i][j];
				image.x = dimension.x - paddingX;
				image.y = dimension.y - paddingY;
				image.width = dimension.width;
				image.height = dimension.height;
			}
		}
	}
}

Phaser.Component.Core.install.call(NinePatchImage.prototype, [
	'Bounds',
	'BringToTop',
	'Destroy',
	'InputEnabled',
	'Delta',
	'Overlap',
	'Reset'
]);