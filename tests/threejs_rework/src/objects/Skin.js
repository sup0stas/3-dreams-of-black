/*
 * Skin
 */

THREE.Skin = function( geometry, materials ) {
	
	THREE.Mesh.call( this, geometry, materials );
	
	
	// init bones

	this.bones        = [];
	this.boneInverses = [];
	this.boneMatrices = [];
	
	if( this.geometry.bones !== undefined ) {
		
		for( var b = 0; b < this.geometry.bones.length; b++ ) {
			
			var bone = this.addBone();
			
			bone.position.x   = this.geometry.bones[ b ].pos [ 0 ];
			bone.position.y   = this.geometry.bones[ b ].pos [ 1 ];
			bone.position.z   = this.geometry.bones[ b ].pos [ 2 ];
			bone.quaternion.x = this.geometry.bones[ b ].rotq[ 0 ];
			bone.quaternion.y = this.geometry.bones[ b ].rotq[ 1 ];
			bone.quaternion.z = this.geometry.bones[ b ].rotq[ 2 ];
			bone.quaternion.w = this.geometry.bones[ b ].rotq[ 3 ];
			bone.scale.x      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 0 ] : 1;
			bone.scale.y      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 1 ] : 1;
			bone.scale.z      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 2 ] : 1;
		}
		
		for( var b = 0; b < this.bones.length; b++ ) {
			
			if( this.geometry.bones[ b ].parent === -1 ) 
				this.addChild( this.bones[ b ] );
			else
				this.bones[ this.geometry.bones[ b ].parent ].addChild( this.bones[ b ] );
		}
		
		this.pose();
	}
}

THREE.Skin.prototype             = new THREE.Mesh();
THREE.Skin.prototype.constructor = THREE.Skin;


/*
 * Add 
 */

THREE.Skin.prototype.addBone = function( object3D ) {
	
	if( object3D === undefined ) 
		object3D = new THREE.Object3D();
	
	this.bones.push( object3D );
	
	return object3D;
}

/*
 * Pose
 */

THREE.Skin.prototype.pose = function() {

	this.update( this, undefined, true );
	
	for( var b = 0; b < this.bones.length; b++ ) {
		
		this.boneInverses.push( THREE.Matrix4.makeInvert( this.bones[ b ].globalMatrix, new THREE.Matrix4()));
		this.boneMatrices.push( this.bones[ b ].globalMatrix.flatten32 );
	}
	

	// project vertices to local 

	if( this.geometry.skinVerticesA === undefined ) {
		
		this.geometry.skinVerticesA = [];
		this.geometry.skinVerticesB = [];
		var orgVertex;
		var vertex;
	
		for( var i = 0; i < this.geometry.skinIndices.length; i++ ) {
			
			orgVertex = this.geometry.vertices[ i ].position;
	
			var indexA = this.geometry.skinIndices[ i ].x;
			var indexB = this.geometry.skinIndices[ i ].y;
	
			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesA.push( this.boneInverses[ indexA ].multiplyVector3( vertex ));
	
			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesB.push( this.boneInverses[ indexB ].multiplyVector3( vertex ));
			
			// todo: add more influences
	
			// normalize weights
	
			if( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y !== 1 ) {
				
				var len = ( 1.0 - ( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y )) * 0.5;
				this.geometry.skinWeights[ i ].x += len;
				this.geometry.skinWeights[ i ].y += len;
			}
		}
	}
}

