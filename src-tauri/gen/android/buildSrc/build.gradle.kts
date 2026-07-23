plugins {
    `kotlin-dsl`
}

gradlePlugin {
    plugins {
        create("pluginsForCoolKids") {
            id = "rust"
            implementationClass = "RustPlugin"
        }
    }
}

repositories {
    maven(url = "https://maven.aliyun.com/repository/central")
    maven(url = "https://maven.aliyun.com/repository/google") {
        content {
            includeGroupByRegex("com\\.android(\\..*)?")
            includeGroupByRegex("androidx(\\..*)?")
            includeGroupByRegex("com\\.google(\\..*)?")
        }
    }
    google()
    mavenCentral()
}

dependencies {
    compileOnly(gradleApi())
    implementation("com.android.tools.build:gradle:8.13.0")
}

