const PRODUCTS=[
{id:1,name:'فستان وردي أنيق',nameEn:'Elegant Pink Dress',cat:'dresses',type:'clothes',price:1290,old:1590,img:'assets/images/dress.jpg',tag:'خصم 19%',available:true},
{id:2,name:'جاكيت بيج كلاسيك',nameEn:'Classic Beige Jacket',cat:'shirts',type:'clothes',price:990,old:1190,img:'assets/images/shirt.jpg',tag:'جديد',available:true},
{id:3,name:'بنطلون أبيض واسع',nameEn:'Wide White Trousers',cat:'pants',type:'clothes',price:790,old:920,img:'assets/images/pants.jpg',tag:'خصم',available:true},
{id:4,name:'فستان أبيض ناعم',nameEn:'Soft White Dress',cat:'dresses',type:'clothes',price:1450,old:0,img:'assets/images/white-dress.jpg',tag:'جديد',available:true},
{id:5,name:'فستان خمري فاخر',nameEn:'Luxury Burgundy Dress',cat:'dresses',type:'clothes',price:1390,old:1690,img:'assets/images/dress-burgundy.jpg',tag:'خصم 18%',available:true},
{id:6,name:'بلوزة بيج',nameEn:'Beige Blouse',cat:'shirts',type:'clothes',price:690,old:790,img:'assets/images/beige-shirt.jpg',tag:'جديد',available:true},
{id:7,name:'بلوزة وردية',nameEn:'Pink Blouse',cat:'shirts',type:'clothes',price:650,old:0,img:'assets/images/pink-blouse.jpg',tag:'',available:true},
{id:8,name:'قميص أسود',nameEn:'Black Shirt',cat:'shirts',type:'clothes',price:720,old:850,img:'assets/images/black-shirt.jpg',tag:'خصم',available:true},
{id:9,name:'سلسلة ذهبية',nameEn:'Gold Necklace',cat:'chains',type:'accessories',price:520,old:650,img:'assets/images/necklace.jpg',tag:'خصم 20%',available:true},
{id:10,name:'ساعة جلد كلاسيكية',nameEn:'Classic Leather Watch',cat:'watches',type:'accessories',price:1250,old:1450,img:'assets/images/watch.jpg',tag:'جديد',available:true},
{id:11,name:'حقيبة وردية',nameEn:'Pink Handbag',cat:'bags',type:'accessories',price:990,old:1150,img:'assets/images/bag.jpg',tag:'خصم',available:true},
{id:12,name:'أقراط لؤلؤ',nameEn:'Pearl Earrings',cat:'rings',type:'accessories',price:390,old:0,img:'assets/images/earrings.jpg',tag:'',available:true},
{id:13,name:'ساعة ذهبية',nameEn:'Gold Watch',cat:'watches',type:'accessories',price:1390,old:1590,img:'assets/images/watch-gold.jpg',tag:'خصم',available:true},
{id:14,name:'بنطلون بيج',nameEn:'Beige Trousers',cat:'pants',type:'clothes',price:820,old:950,img:'assets/images/beige-pants.jpg',tag:'خصم',available:true},
{id:15,name:'حقيبة سوداء',nameEn:'Black Handbag',cat:'bags',type:'accessories',price:1090,old:1290,img:'assets/images/black-bag.jpg',tag:'جديد',available:true},
{id:16,name:'وشاح شتوي',nameEn:'Winter Scarf',cat:'bracelets',type:'accessories',price:420,old:0,img:'assets/images/scarf.jpg',tag:'',available:true},
{id:17,name:'فستان وردي طويل',nameEn:'Long Pink Dress',cat:'dresses',type:'clothes',price:1350,old:0,img:'assets/images/pink-dress.jpg',tag:'جديد',available:true},
{id:18,name:'توب أبيض',nameEn:'White Top',cat:'shirts',type:'clothes',price:540,old:650,img:'assets/images/white-top.jpg',tag:'خصم',available:true},
{id:19,name:'بنطلون كتان رملي',nameEn:'Sand Linen Trousers',cat:'pants',type:'clothes',price:760,old:890,img:'assets/images/pants.jpg',tag:'جديد',available:true},
{id:20,name:'بنطلون واسع كريمي',nameEn:'Cream Wide Trousers',cat:'pants',type:'clothes',price:840,old:980,img:'assets/images/beige-pants.jpg',tag:'خصم',available:true}
];
function getProduct(id){return PRODUCTS.find(p=>p.id===Number(id))}
