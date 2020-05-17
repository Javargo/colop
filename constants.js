//****************************************
//MISCALLENOUS CONSTANT VALUES FOR PILE ANALYSIS
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-04-13	Start

//****************************************
//Todo

//****************************************
//Dependencies

//****************************************

const soilCathegories=
[
	//1
	{
		points: [[0, 0], [52, 6], [50, 15], [46, 26], [39, 40], [31, 52], [25, 57], [15, 62], [0, 66], [0, 0]],
		color: "#ff8041",
		description_hu: "Érzékeny, finom szemcsés talaj"
	},
	//2
	{
		points: [[0, 0], [200, 0], [200, 64], [80, 10], [52, 6]],
		color: "#dbac64",
		description_hu: "Szerves talaj, tőzeg"
	},
	//3
	{
		points: [[52, 6], [80, 10], [200, 64], [200, 119], [103, 119], [101, 113], [87, 87], [71, 66], [61, 56], [50, 47], [39, 40], [46, 26], [50, 15]],
		color: "#fec1ff",
		description_hu: "Agyag"
	},
	//4
	{
		points: [[39, 40], [50, 47], [61, 56], [71, 66], [87, 87], [101, 113], [103, 119], [98, 119], [93, 124], [88, 113], [80, 99], [71, 87], [54, 68], [44, 59], [31, 52]],
		color: "#808080",
		description_hu: "Iszapos agyag - agyag"
	},
	//5
	{
		points: [[31, 52], [44, 59], [54, 68], [71, 87], [80, 99], [88, 113], [93, 124], [79, 139], [75, 128], [62, 106], [47, 87], [23, 67], [15, 62], [25, 57]],
		color: "#acacac",
		description_hu: "Agyagos iszap - iszapos agyag"
	},
	//6
	{
		points: [[15, 62], [23, 67], [47, 87], [62, 106], [75, 128], [79, 139], [65, 155], [55, 134], [35, 105], [15, 86], [5, 81], [0, 80], [0, 66]],
		color: "#adbe33",
		description_hu: "Homokos iszap - agyagos iszap"
	},
	//7
	{
		points: [[0, 80], [5, 81], [15, 86], [35, 105], [55, 134], [65, 155], [49, 172], [41, 150], [33, 133], [24, 121], [17, 113], [0, 98]],
		color: "#b3df92",
		description_hu: "Iszapos homok - homokos iszap"
	},
	//8
	{
		points: [[0, 98], [17, 113], [24, 121], [33, 133], [41, 150], [49, 172], [40, 184], [37, 193], [32, 171], [25, 152], [13, 134], [6, 126], [0, 123]],
		color: "#ffc384",
		description_hu: "Homok - iszapos homok"
	},
	//9
	{
		points: [[0, 123], [6, 126], [13, 134], [25, 152], [32, 171], [37, 193], [37, 200], [24, 200], [22, 186], [17, 172], [11, 161], [0, 151]],
		color: "#ffdfb9",
		description_hu: "Homok"
	},
	//10
	{
		points: [[0, 151], [11, 161], [17, 172], [22, 186], [24, 200], [0, 200]],
		color: "#feffd1",
		description_hu: "Kavicsos homok - homok"
	},
	//11
	{
		points: [[200, 200], [94, 200], [94, 180], [79, 139], [93, 124], [98, 119], [103, 119], [200, 119]],
		color: "#a09335",
		description_hu: "Nagyon merev, finom szemcsés homok (túlkonszolidált vagy cementált)"
	},
	//12
	{
		points: [[94, 200], [37, 200], [37, 193], [40, 184], [49, 172], [65, 155], [79, 139], [94, 180], [94, 200], [37, 200]],
		color: "#f4b48e",
		description_hu: "Nagyon merev homok - agyagos homok (túlkonszolidált vagy cementált)"
	}
];

const granularPoints=[[0,200], [0,66], [15,62], [23,67], [47,87], [62,106], [75,128], [79,139], [94,180], [94,200]];

const technologycalFactors=
[
	{
		description_hu: "vert, előre gyártott vasbeton elem",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.90, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 150, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.05, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 85, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.10, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.10 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "vert, zárt végű bennmaradó acélcső",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.75, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 120, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 0.80, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 70, //palástellenállás maximuma, kötött talajnál
			gamma_b: 1.10, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.10 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "zárt véggel lehajtott és visszahúzott cső helyén betonozott",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 1.10, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 160, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.10, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 90, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.10, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.10 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "csavart, helyben betonozott",
		alpha_b: 0.80, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.75, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 160, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.90, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.25, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 100, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.25, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.20 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "CFA-cölöp",
		alpha_b: 0.70, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.55, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 120, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.90, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.20, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.15 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "fúrt, támasztófolyadék védelemmel",
		alpha_b: 0.50, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.50, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 100, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.80, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.25, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.20 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	},
	
	{
		description_hu: "fúrt, béléscső védelemmel",
		alpha_b: 0.50, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.45, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 80, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.80, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80, //palástellenállás maximuma, kötött talajnál
		gamma_b: 1.25, //talpellenás korrelációs tényezője a biztonság számításánál
		gamma_s: 1.10, //palástellenás korrelációs tényezője nyomott cölöp esetében a biztonság számításánál
		gamma_st_pull: 1.25, //palástellenás korrelációs tényezője húzott cölöp esetében a biztonság számításánál
		gamma_st_buoyingup: 1.40, //palástellenás korrelációs tényezője felúszás esetében a biztonság számításánál
		gamma_t: 1.20 //teljes ellenállás korrelációs tényezője a biztonság számításánál
	}
];

var Nkts=
[
	13,
	15,
	17
];

var xiMean=
[
	0,
	1.4,
	1.35,
	1.33,
	1.31,
	1.29,
	1.28,
	1.27,
	1.26,
	1.26,
	1.25
];

var xiMin=
[
	0,
	1.40,
	1.27,
	1.23,
	1.20,
	1.15,
	1.13,
	1.12,
	1.10,
	1.09,
	1.08	
];

var parcialFactors=
[
	{method:"cölöppróbaterhelés",  gammaRd:1.0},
	{method:"CPT vizsgálat",  gammaRd:1.1},
	{method:"egyéb talajvizsgálat",  gammaRd:1.2},
	{method:"tapasztalat",  gammaRd:1.3}
];

